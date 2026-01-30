#!/usr/bin/env python3
"""
Generate password hash for admin users
Usage: python generate_password_hash.py
"""

from werkzeug.security import generate_password_hash

def main():
    print("=" * 50)
    print("Password Hash Generator")
    print("=" * 50)
    
    password = input("\nEnter password to hash: ")
    
    if not password:
        print("❌ Password cannot be empty!")
        return
    
    # Generate hash using scrypt (default in Werkzeug 3.x)
    password_hash = generate_password_hash(password)
    
    print("\n" + "=" * 50)
    print("✅ Password Hash Generated!")
    print("=" * 50)
    print(f"\nPassword: {password}")
    print(f"\nHash: {password_hash}")
    
    print("\n" + "=" * 50)
    print("SQL Command to update admin:")
    print("=" * 50)
    print(f"\nUPDATE admins")
    print(f"SET password_hash = '{password_hash}'")
    print(f"WHERE username = 'admin';")
    print("\n" + "=" * 50)

if __name__ == "__main__":
    main()
