import bcrypt
from flask import Blueprint, request, jsonify
from .utils import users_collection
from .crypt import check

register_bp = Blueprint('register', __name__)


def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


@register_bp.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        invitation_code = data.get('invitationCode')

        if not username:
            return jsonify({"success": False, "message": "Username can't be empty"})
        if not password:
            return jsonify({"success": False, "message": "Password can't be empty"})

        if users_collection.find_one({"username": username}):
            return jsonify({"success": False, "message": "Username already exists"})

        user_class = 0
        if invitation_code:
            if not check(invitation_code):
                return jsonify({"success": False, "message": "Invalid invitation code"})
            user_class = 1

        result = users_collection.insert_one({
            "username": username,
            "password": _hash_password(password),
            "class": user_class
        })

        if result.inserted_id:
            return jsonify({"success": True, "message": "User registered successfully"})
        return jsonify({"success": False, "message": "Error saving user"})

    except Exception as e:
        return jsonify({"success": False, "message": f"An unexpected error occurred: {str(e)}"})
