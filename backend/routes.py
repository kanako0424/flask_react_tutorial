from app import app, db
from flask import request, jsonify
from models import Friend
import requests
import os

# Replace with your actual LINE channel ID
LINE_CHANNEL_ID = os.getenv("LINE_CHANNEL_ID")


def verify_id_token(id_token):
    url = "https://api.line.me/oauth2/v2.1/verify"
    payload = {"id_token": id_token, "client_id": LINE_CHANNEL_ID}
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    response = requests.post(url, data=payload, headers=headers)

    if response.status_code == 200:
        response_json = response.json()
        return response_json
    else:
        response.raise_for_status()


# verify LINE UserID
@app.route("/api/verify", methods=["POST"])
def verify():
    data = request.json
    id_token = data.get("idToken")

    try:
        user_info = verify_id_token(id_token)
        return user_info
    except Exception as e:
        print(f"Error verifying ID token: {e}")
        return jsonify({"isValid": False}), 400


@app.route("/api/issue-channel-access-token", methods=["GET", "POST"])
def issue_channel_access_token():
    url = "https://api.line.me/oauth2/v3/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "client_credentials",
        "client_id": os.getenv("LINE_MINIAPP_CHANNEL_ID"),
        "client_secret": os.getenv("LINE_MINIAPP_CHANNEL_SECRET"),
    }

    response = requests.post(url, headers=headers, data=data)

    if response.status_code != 200:
        return (
            jsonify({"error": f"Failed to issue access token: {response.text}"}),
            response.status_code,
        )

    return jsonify(response.json())


@app.route('/api/send-service-message', methods=['POST'])
def send_service_message():
    liff_access_token = request.json.get('liffAccessToken')
    if not liff_access_token:
        return jsonify({"error": "LIFF Access Token is required"}), 400

    # Step 1: Get Channel Access Token
    channel_access_token_response = requests.post(
        "https://api.line.me/oauth2/v3/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "grant_type": "client_credentials",
            "client_id": os.getenv("LINE_MINIAPP_CHANNEL_ID"),
            "client_secret": os.getenv("LINE_MINIAPP_CHANNEL_SECRET")
        }
    )

    if channel_access_token_response.status_code != 200:
        return jsonify({"error": f"Failed to issue access token: {channel_access_token_response.text}"}), channel_access_token_response.status_code

    channel_access_token = channel_access_token_response.json().get('access_token')
    print(channel_access_token)

    # Step 2: Get Notification Token
    notification_token_response = requests.post(
        "https://api.line.me/message/v3/notifier/token",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {channel_access_token}"
        },
        json={
            "liffAccessToken": liff_access_token
        }
    )

    if notification_token_response.status_code != 200:
        return jsonify({"error": "Failed to get notification token", "details": notification_token_response.json()}), notification_token_response.status_code

    notification_token_data = notification_token_response.json()

    # Step 3: Send Service Message
    service_message_response = requests.post(
        "https://api.line.me/message/v3/notifier/send?target=service",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {channel_access_token}"
        },
        json={
            "templateName": "join_d_m_ja",
            "params": {
                "btn1_url": "https://my-friend-j1c9.onrender.com",
                "entry_date": "2033/3/31 0:00",
                "expiration": "2044/10/10 0:00",
                "user_number": "11023",
            },
            "notificationToken": notification_token_data.get('notificationToken')
        }
    )

    if service_message_response.status_code != 200:
        return jsonify({"error": "Failed to send service message", "details": service_message_response.json()}), service_message_response.status_code

    return jsonify(service_message_response.json())


# Get all friends
@app.route("/api/friends", methods=["GET"])
def get_friends():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "Missing userId parameter"}), 400

    try:
        friends = Friend.query.filter_by(creatorId=user_id).all()
        result = [friend.to_json() for friend in friends]
        return jsonify(result)
    except Exception as e:
        print(f"Error fetching friends: {e}")
        return jsonify({"error": str(e)}), 500


# Create a friend
@app.route("/api/friends", methods=["POST"])
def create_friend():
    try:
        data = request.json

        # Validations
        required_fields = ["name", "role", "description", "gender"]
        for field in required_fields:
            if field not in data or not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400

        name = data.get("name")
        role = data.get("role")
        description = data.get("description")
        gender = data.get("gender")
        creatorId = data.get("creatorId")
        print("routes.py l.29 creatorid: ", creatorId)

        # Fetch avatar image based on gender
        if gender == "male":
            img_url = f"https://avatar.iran.liara.run/public/boy?username={name}"
        elif gender == "female":
            img_url = f"https://avatar.iran.liara.run/public/girl?username={name}"
        else:
            img_url = None

        new_friend = Friend(
            name=name,
            role=role,
            description=description,
            gender=gender,
            img_url=img_url,
            creatorId=creatorId,
        )

        db.session.add(new_friend)
        db.session.commit()

        return jsonify(new_friend.to_json()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Delete a friend
@app.route("/api/friends/<int:id>", methods=["DELETE"])
def delete_friend(id):
    try:
        friend = Friend.query.get(id)
        if friend is None:
            return jsonify({"error": "Friend not found"}), 404

        db.session.delete(friend)
        db.session.commit()
        return jsonify({"msg": "Friend deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Update a friend profile
@app.route("/api/friends/<int:id>", methods=["PATCH"])
def update_friend(id):
    try:
        friend = Friend.query.get(id)
        if friend is None:
            return jsonify({"error": "Friend not found"}), 404

        data = request.json

        friend.name = data.get("name", friend.name)
        friend.role = data.get("role", friend.role)
        friend.description = data.get("description", friend.description)
        friend.gender = data.get("gender", friend.gender)

        db.session.commit()
        return jsonify(friend.to_json()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
