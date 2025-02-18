import cv2
import numpy as np
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from fastapi import HTTPException
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


MAILTRAP_USERNAME = "cbd025e0963284"
MAILTRAP_PASSWORD = "a3a758a794ece5"
MAILTRAP_HOST = "sandbox.smtp.mailtrap.io"
MAILTRAP_PORT = 587  # Typically 2525 or 587


SECRET_KEY = "your_secret_key"  # Change to a strong secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Token expiration time (in minutes)
EMAIL_VERIFICATION_EXPIRE_MINUTES = 60 

# Function to create a JWT token
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Function to create an email verification token
def create_verification_token(email: str):
    expire = datetime.utcnow() + timedelta(minutes=EMAIL_VERIFICATION_EXPIRE_MINUTES)
    payload = {"sub": email, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# Function to verify the token
def verify_email_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Verification link expired")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Invalid verification link")

# Function to verify the JWT token
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    

# Function to hash a password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Function to verify a password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def analyze_skin_tone_from_image(image: np.ndarray) -> str:
    """
    Analyze the skin tone of the image using YCrCb and LAB color space.
    """
    # Convert image to YCrCb and LAB color spaces
    image_ycrcb = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
    image_lab = cv2.cvtColor(image, cv2.COLOR_BGR2Lab)

    # Extract mean values
    avg_cr = np.mean(image_ycrcb[:, :, 1])  # Red chrominance
    avg_cb = np.mean(image_ycrcb[:, :, 2])  # Blue chrominance
    avg_l = np.mean(image_lab[:, :, 0])  # Lightness

    # Classify skin tone based on refined Cr, Cb, and L thresholds
    if avg_l > 190 and avg_cr > 140:
        return "Very Fair"
    elif avg_l > 160 and avg_cr > 135:
        return "Fair"
    elif avg_l > 130 and avg_cr > 130:
        return "Medium"
    elif avg_l > 100 and avg_cr > 125:
        return "Olive"
    elif avg_l > 70 and avg_cr > 120:
        return "Dark Brown"
    else:
        return "Deeply Pigmented"
    
# Function to send verification email
def send_verification_email(recipient_email: str, username: str, token: str):
    sender_email = "noreply@example.com"
    verification_link = f"http://localhost:8081/verify-email?token={token}"  # Adjust URL for frontend

    subject = "Verify Your Email"
    body = f"""
    Hi {username},

    Thank you for registering! Please verify your email by clicking the link below:

    {verification_link}

    This link will expire in 1 hour.

    Best regards,
    The Team
    """

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = recipient_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(MAILTRAP_HOST, MAILTRAP_PORT) as server:
            server.starttls()
            server.login(MAILTRAP_USERNAME, MAILTRAP_PASSWORD)
            server.sendmail(sender_email, recipient_email, msg.as_string())
        print(f"Verification email sent to {recipient_email}")
    except Exception as e:
        print(f"Error sending email: {e}")

