import sqlite3
import json

con = sqlite3.connect('prosensia.db')
cur = con.cursor()
rows = list(cur.execute('SELECT id,station,item,status,eta_minutes,runner_id,created_at FROM orders ORDER BY id DESC LIMIT 10'))
con.close()
print(json.dumps(rows, default=str, indent=2))
