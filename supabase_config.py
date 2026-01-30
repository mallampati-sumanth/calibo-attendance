"""
Supabase Configuration for Student Attendance Tracker
"""
import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
project_folder = os.path.expanduser('~/attendance_tracker')
load_dotenv(os.path.join(project_folder, '.env'))

class SupabaseClient:
    def __init__(self, url, key):
        self.url = url
        self.key = key
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def table(self, table_name):
        return SupabaseQueryBuilder(self.url, self.headers, table_name)

import requests
import json
import os

class SupabaseQueryBuilder:
    def __init__(self, base_url, headers, table_name):
        self.base_url = base_url.rstrip('/')
        self.headers = headers
        self.table_url = f"{self.base_url}/rest/v1/{table_name}"
        self.params = {}
        self.method = 'GET'
        self.json_data = None

    def select(self, columns="*"):
        self.method = 'GET'
        self.params["select"] = columns
        return self

    def insert(self, data, count=None):
        self.method = 'POST'
        self.headers['Prefer'] = 'return=representation'
        if count:
             self.headers['Prefer'] += f',count={count}'
        self.json_data = data
        return self

    def update(self, data, count=None):
        self.method = 'PATCH'
        self.headers['Prefer'] = 'return=representation'
        if count:
             self.headers['Prefer'] += f',count={count}'
        self.json_data = data
        return self

    def delete(self, count=None):
        self.method = 'DELETE'
        self.headers['Prefer'] = 'return=representation' 
        if count:
             self.headers['Prefer'] += f',count={count}'
        return self

    def eq(self, column, value):
        # Properly format as column=eq.value (not separate params)
        self.params[f"{column}"] = f"eq.{value}"
        return self
    
    def gte(self, column, value):
        self.params[column] = f"gte.{value}"
        return self

    def lte(self, column, value):
        self.params[column] = f"lte.{value}"
        return self
        
    def order(self, column, desc=False):
        order_val = f"{column}.desc" if desc else f"{column}.asc"
        # Handle multiple orders if needed, but simple append for now
        if "order" in self.params:
             self.params["order"] += f",{order_val}"
        else:
             self.params["order"] = order_val
        return self
    
    def execute(self):
        try:
            if self.method == 'GET':
                response = requests.get(self.table_url, headers=self.headers, params=self.params)
            elif self.method == 'POST':
                response = requests.post(self.table_url, headers=self.headers, params=self.params, json=self.json_data)
            elif self.method == 'PATCH':
                response = requests.patch(self.table_url, headers=self.headers, params=self.params, json=self.json_data)
            elif self.method == 'DELETE':
                response = requests.delete(self.table_url, headers=self.headers, params=self.params)
            
            response.raise_for_status()
            
            # Helper for empty responses (e.g., 204 No Content)
            if response.status_code == 204:
                 return type('Response', (), {'data': [], 'count': 0})
            
            try:
                data = response.json()
            except ValueError:
                data = []

            return type('Response', (), {'data': data, 'count': len(data) if isinstance(data, list) else 0})
            
        except requests.exceptions.HTTPError as e:
            print(f"HTTP Error: {e}")
            try:
                print(f"Response: {response.text}")
            except:
                pass
            raise e


def get_supabase_client():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        # Fallback to defaults or raise error
        # Check if we are using the placeholders
        if not url or "your-project" in url:
             raise ValueError("Supabase URL and Key must be set in environment variables.")
        
    return SupabaseClient(url, key)
