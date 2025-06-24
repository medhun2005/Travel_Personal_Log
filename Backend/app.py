# app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import bcrypt
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:aaaa@localhost/travel_log'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password_hash = db.Column(db.String(255))
    trips = db.relationship('Trip', backref='user', lazy=True)

class Trip(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    destination = db.Column(db.String(255))
    date = db.Column(db.Date)
    notes = db.Column(db.Text)
    image_url = db.Column(db.Text)
    rating = db.Column(db.Float)

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user:
        if bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
            return jsonify({'message': 'Login successful', 'user_id': user.id, 'name': user.name})
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    else:
        hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        new_user = User(name=data.get('name', 'New User'), email=data['email'], password_hash=hashed)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered and logged in', 'user_id': new_user.id, 'name': new_user.name})

@app.route('/trips/<int:user_id>', methods=['GET'])
def get_trips(user_id):
    trips = Trip.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': t.id,
        'destination': t.destination,
        'date': t.date.strftime('%Y-%m-%d'),
        'notes': t.notes,
        'image_url': t.image_url,
        'rating': t.rating
    } for t in trips])

@app.route('/trip', methods=['POST'])
def add_trip():
    data = request.json
    trip = Trip(
        user_id=data['user_id'],
        destination=data['destination'],
        date=datetime.strptime(data['date'], '%Y-%m-%d'),
        notes=data['notes'],
        image_url=data['image_url'],
        rating=float(data['rating'])
    )
    db.session.add(trip)
    db.session.commit()
    return jsonify({'message': 'Trip added'})

@app.route('/trip/<int:trip_id>', methods=['DELETE'])
def delete_trip(trip_id):
    trip = Trip.query.get(trip_id)
    if not trip:
        return jsonify({'message': 'Trip not found'}), 404
    db.session.delete(trip)
    db.session.commit()
    return jsonify({'message': 'Trip deleted'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
