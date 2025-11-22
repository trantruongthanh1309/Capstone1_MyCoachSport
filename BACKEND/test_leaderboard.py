# Test leaderboard API
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import app
from db import db
from sqlalchemy import text

def test_leaderboard_api():
    """Test the leaderboard API endpoint"""
    
    with app.app_context():
        # Test the query directly
        print("🧪 Testing Leaderboard Query...\n")
        
        query = text("""
            SELECT TOP 50
                u.Id as UserID,
                u.Name,
                u.Email,
                u.Sport as PreferredSport,
                u.Goal as FitnessGoal,
                COALESCE(l.TotalPoints, 0) as TotalPoints,
                COALESCE(l.WorkoutsCompleted, 0) as WorkoutsCompleted,
                COALESCE(l.ChallengesCompleted, 0) as ChallengesCompleted,
                GETDATE() as CreatedAt
            FROM dbo.Users u
            LEFT JOIN (
                SELECT 
                    User_id,
                    SUM(Points) as TotalPoints,
                    COUNT(DISTINCT CASE WHEN Challenge_name LIKE '%Workout%' OR Challenge_name LIKE '%workout%' THEN Id END) as WorkoutsCompleted,
                    COUNT(DISTINCT Id) as ChallengesCompleted
                FROM dbo.Leaderboard
                WHERE User_id IS NOT NULL
                GROUP BY User_id
            ) l ON u.Id = l.User_id
            ORDER BY COALESCE(l.TotalPoints, 0) DESC, u.Name ASC
        """)
        
        try:
            results = db.session.execute(query).fetchall()
            
            print(f"✅ Query successful! Found {len(results)} users\n")
            print("="*80)
            print(f"{'Rank':<6} {'Name':<20} {'Points':<10} {'Workouts':<12} {'Challenges':<12}")
            print("="*80)
            
            for idx, row in enumerate(results[:10], 1):
                user_id, name, email, sport, goal, points, workouts, challenges, created = row
                badge = "🥇" if idx == 1 else "🥈" if idx == 2 else "🥉" if idx == 3 else "  "
                print(f"{badge} {idx:<4} {name:<20} {points:<10} {workouts:<12} {challenges:<12}")
            
            if len(results) > 10:
                print(f"\n... and {len(results) - 10} more users")
            
            print("\n" + "="*80)
            print("📊 Summary:")
            total_points = sum(row[5] for row in results)
            total_workouts = sum(row[6] for row in results)
            total_challenges = sum(row[7] for row in results)
            
            print(f"Total Points: {total_points:,}")
            print(f"Total Workouts: {total_workouts}")
            print(f"Total Challenges: {total_challenges}")
            
            # Test API endpoint
            print("\n" + "="*80)
            print("🌐 Testing API Endpoint...")
            print("="*80)
            
            with app.test_client() as client:
                response = client.get('/api/leaderboard/')
                print(f"Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.get_json()
                    print(f"✅ API Response: {data.get('success')}")
                    print(f"Total Users: {data.get('total')}")
                    if data.get('data'):
                        print(f"\nFirst user: {data['data'][0]['name']} - {data['data'][0]['totalPoints']} points")
                else:
                    print(f"❌ Error: {response.data}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_leaderboard_api()
