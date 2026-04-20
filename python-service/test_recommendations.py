"""
Test script for visualization recommendations endpoint
"""
import requests
import json
import pandas as pd
import sqlite3
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_recommend_visualizations():
    """Test the /api/recommend-visualizations endpoint"""
    
    # Use one of the existing uploaded CSVs to create a test database
    csv_path = Path("uploads/1772283912_Smartphone_Usage_Productivity_Dataset_50000.csv")
    
    if not csv_path.exists():
        print("❌ Test CSV not found. Creating sample data...")
        # Create sample data
        df = pd.DataFrame({
            'Month': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            'Sales': [45000, 52000, 48000, 61000, 55000, 67000],
            'Profit': [9000, 12000, 8500, 15000, 11000, 16000],
            'Region': ['North', 'North', 'South', 'South', 'East', 'West'],
            'Units_Sold': [250, 320, 280, 410, 330, 470]
        })
        db_path = "test_data.db"
        
        conn = sqlite3.connect(db_path)
        df.to_sql('data', conn, if_exists='replace', index=False)
        conn.close()
        print(f"✅ Created test database: {db_path}")
    else:
        # Use the uploaded CSV
        print(f"📂 Using existing CSV: {csv_path}")
        df = pd.read_csv(csv_path, nrows=1000)  # Limit rows for faster processing
        db_path = "test_smartphone.db"
        
        conn = sqlite3.connect(db_path)
        df.to_sql('data', conn, if_exists='replace', index=False)
        conn.close()
        print(f"✅ Created test database from CSV: {db_path}")
    
    # Prepare request
    payload = {
        "db_path": db_path,
        "query": "SELECT * FROM data LIMIT 500"
    }
    
    print(f"\n📤 Sending request to {BASE_URL}/api/recommend-visualizations")
    print(f"   Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/recommend-visualizations",
            json=payload,
            timeout=30
        )
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ SUCCESS! Recommendations generated:")
            print(json.dumps(result, indent=2))
            
            # Print recommendations in a readable format
            if "recommendations" in result:
                print(f"\n📊 Visualization Recommendations:")
                for i, rec in enumerate(result["recommendations"], 1):
                    print(f"\n   {i}. {rec.get('title', 'Unknown')}")
                    print(f"      Type: {rec.get('type', 'N/A')}")
                    print(f"      X-Axis: {rec.get('x_axis', 'N/A')}")
                    print(f"      Y-Axis: {rec.get('y_axis', 'N/A')}")
                    print(f"      Rationale: {rec.get('rationale', 'N/A')}")
            
            if "features_analyzed" in result:
                print(f"\n📈 Dataset Analysis:")
                features = result["features_analyzed"]
                print(f"   Rows: {features.get('row_count')}")
                print(f"   Columns: {features.get('column_count')}")
                print(f"   Numeric Columns: {features.get('numeric_columns')}")
                print(f"   Categorical Columns: {features.get('categorical_columns')}")
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    
    except requests.exceptions.Timeout:
        print("❌ Request timed out. Make sure the service is running.")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Is the service running on http://localhost:8000?")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Visualization Recommendations Endpoint\n")
    success = test_recommend_visualizations()
    exit(0 if success else 1)
