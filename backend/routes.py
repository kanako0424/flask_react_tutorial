from app import app, db
from flask import request, jsonify
from models import Friend
import requests

# Replace with your actual LINE channel ID
LINE_CHANNEL_ID = '2006014570'

def verify_id_token(id_token):
    url = 'https://api.line.me/oauth2/v2.1/verify'
    payload = {
        'id_token': id_token,
        'client_id': LINE_CHANNEL_ID
    }
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    response = requests.post(url, data=payload, headers=headers)
    
    if response.status_code == 200:
        response_json = response.json()
        return response_json
    else:
        response.raise_for_status()  
        

#verify LINE UserID
@app.route('/api/verify', methods=['POST'])
def verify():
    data = request.json
    id_token = data.get('idToken')
    print("\nid_token:", id_token, "\n")
    
    try:
        user_info = verify_id_token(id_token)
        return user_info
    except Exception as e:
        print(f"Error verifying ID token: {e}")
        return jsonify({"isValid": False}), 400

if __name__ == "__main__":
    app.run(debug=True)


# Get all friends
@app.route("/api/friends",methods=["GET"])
def get_friends():
    user_id = request.args.get('userId')
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
@app.route("/api/friends",methods=["POST"])
def create_friend():
  try:
    data = request.json

    # Validations
    required_fields = ["name","role","description","gender"]
    for field in required_fields:
      if field not in data or not data.get(field):
        return jsonify({"error":f'Missing required field: {field}'}), 400

    name = data.get("name")
    role = data.get("role")
    description = data.get("description")
    gender = data.get("gender")
    creatorId = data.get("creatorId")
    print("routes.py l.29 creatorid: ",creatorId)

    # Fetch avatar image based on gender
    if gender == "male":
      img_url = f"https://avatar.iran.liara.run/public/boy?username={name}"
    elif gender == "female":
      img_url = f"https://avatar.iran.liara.run/public/girl?username={name}"
    else:
      img_url = None

    new_friend = Friend(name=name, role=role, description=description, gender=gender, img_url=img_url, creatorId=creatorId)

    db.session.add(new_friend) 
    db.session.commit()

    return jsonify(new_friend.to_json()), 201
    
  except Exception as e:
    db.session.rollback()
    return jsonify({"error":str(e)}), 500
  
# Delete a friend
@app.route("/api/friends/<int:id>",methods=["DELETE"])
def delete_friend(id):
    try:
        friend = Friend.query.get(id)
        if friend is None:
            return jsonify({"error":"Friend not found"}), 404
		
        db.session.delete(friend)
        db.session.commit()
        return jsonify({"msg":"Friend deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error":str(e)}),500
    
    
# Update a friend profile
@app.route("/api/friends/<int:id>",methods=["PATCH"])
def update_friend(id):
  try:
    friend = Friend.query.get(id)
    if friend is None:
      return jsonify({"error":"Friend not found"}), 404
    
    data = request.json

    friend.name = data.get("name",friend.name)
    friend.role = data.get("role",friend.role)
    friend.description = data.get("description",friend.description)
    friend.gender = data.get("gender",friend.gender)

    db.session.commit()
    return jsonify(friend.to_json()),200
  except Exception as e:
    db.session.rollback()
    return jsonify({"error":str(e)}),500