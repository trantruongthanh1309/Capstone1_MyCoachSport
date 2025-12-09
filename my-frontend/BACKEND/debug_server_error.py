from app import app
import json

def debug_request(path):
    print(f"\n--- Testing {path} ---")
    with app.test_client() as client:
        # Simulate session if needed, though middleware is currently disabled
        with client.session_transaction() as sess:
            sess['user_id'] = 1
            sess['role'] = 'admin'
            
        try:
            response = client.get(path)
            print(f"Status Code: {response.status_code}")
            if response.status_code == 500:
                print("Response Data (Error):")
                print(response.data.decode('utf-8'))
            else:
                print("Response Data (Success/Other):")
                # print first 200 chars to avoid clutter
                print(response.data.decode('utf-8')[:200])
        except Exception as e:
            print(f"EXCEPTION DURING REQUEST: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    # Test the endpoints reported as failing
    debug_request('/api/admin/dashboard/stats')
    debug_request('/api/admin/users')
    debug_request('/api/admin/posts')
