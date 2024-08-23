from app import app, db
from flask import request, jsonify
from models import Friend, User
import requests
import os
from datetime import datetime
from zoneinfo import ZoneInfo

LINE_MINIAPP_CHANNEL_ID="2005976312"
LINE_MINIAPP_CHANNEL_SECRET="d2ccbcc3af23a2bff207880cef1fd5d3"

@app.route('/api/login', methods=['GET', 'POST'])
def login():
    user_id = request.json.get('userId')
    liff_access_token = request.json.get('liffAccessToken')

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    # Check if the user is already registered
    existing_user = User.query.filter_by(userId=user_id).first()
    is_registered = existing_user is not None
    
    if is_registered:
        return jsonify({"message": "User already logined"}), 200
    else:
      # Register the new user
      new_user = User(userId=user_id)
      db.session.add(new_user)
      db.session.commit()
      # send_service_message
      send_service_message_response = send_service_message(liff_access_token, user_id)
      
      return jsonify({"message": "User logined successfully", "user_id": user_id, "send_service_message_response": send_service_message_response}), 201


@app.route("/api/verify", methods=["POST"])
def verify():
    data = request.json
    if data is None:
        print("Error: Request body is not valid JSON")
        return jsonify({"isValid": False, "error": "Invalid JSON"}), 400

    id_token = data.get("idToken")
    if id_token is None:
        print("Error: 'idToken' not found in request body")
        return jsonify({"isValid": False, "error": "Missing idToken"}), 400

    url = "https://api.line.me/oauth2/v2.1/verify"
    payload = {"id_token": id_token, "client_id": LINE_MINIAPP_CHANNEL_ID}
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    try:
        response = requests.post(url, data=payload, headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors
        response_json = response.json()
        return jsonify(response_json)
    except requests.exceptions.RequestException as e:
        print(f"Error verifying ID token: {e}")
        return jsonify({"isValid": False, "error": str(e)}), 400


@app.route("/api/issue-channel-access-token", methods=["GET", "POST"])
def issue_channel_access_token():
    url = "https://api.line.me/oauth2/v3/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "client_credentials",
        "client_id": LINE_MINIAPP_CHANNEL_ID,
        "client_secret": LINE_MINIAPP_CHANNEL_SECRET,
    }

    response = requests.post(url, headers=headers, data=data)

    if response.status_code != 200:
        return (
            jsonify({"error": f"Failed to issue access token: {response.text}"}),
            response.status_code,
        )

    return jsonify(response.json())


def send_service_message(liff_access_token, user_id):
    # Step 1: Get Channel Access Token
    channel_access_token_response = requests.post(
        "https://api.line.me/oauth2/v3/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "grant_type": "client_credentials",
            "client_id": LINE_MINIAPP_CHANNEL_ID,
            "client_secret": LINE_MINIAPP_CHANNEL_SECRET
        }
    )

    if channel_access_token_response.status_code != 200:
        raise Exception(f"Failed to issue access token: {channel_access_token_response.text}")

    channel_access_token = channel_access_token_response.json().get('access_token')

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
        raise Exception(f"Failed to get notification token: {notification_token_response.json()}")

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
                "btn1_url": "https://miniapp.line.me/2005976312-NqAkEXnX",
                "entry_date": datetime.now(ZoneInfo("Asia/Tokyo")).strftime("%Y/%m/%d %H:%M"),
                "user_number": user_id,
            },
            "notificationToken": notification_token_data.get('notificationToken')
        }
    )

    if service_message_response.status_code != 200:
        raise Exception(f"Failed to send service message: {service_message_response.json()}")

    return service_message_response.json()


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
