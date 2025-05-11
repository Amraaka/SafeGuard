from twilio.rest import Client
import os
import argparse
import json
import sys

def send_twilio_message(to_phone, body_text, media_url=None):
    """
    Send SMS/MMS via Twilio
    
    Args:
        to_phone (str): Recipient phone number
        body_text (str): Message content
        media_url (list, optional): List of media URLs to attach
    
    Returns:
        dict: Message details including SID and status
    """
    try:
        # Get credentials from environment variables
        account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
        auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
        from_phone = os.environ.get('TWILIO_PHONE_NUMBER')
        
        if not all([account_sid, auth_token, from_phone]):
            raise ValueError("Missing Twilio credentials or phone number in environment variables")
        
        # Initialize Twilio client
        client = Client(account_sid, auth_token)
        
        # Prepare message parameters
        message_params = {
            'to': to_phone,
            'from_': from_phone,
            'body': body_text
        }
        
        # Add media URLs if provided
        if media_url:
            message_params['media_url'] = media_url
            
        # Send the message
        message = client.messages.create(**message_params)
        
        print(f"SMS илгээгдлээ. SID: {message.sid}")
        
        return {
            'success': True,
            'sid': message.sid,
            'status': message.status,
            'to': to_phone,
            'from': from_phone
        }
        
    except Exception as e:
        print(f"Error sending message: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Send messages via Twilio')
    
    # Command line arguments
    parser.add_argument('--function', type=str, default='send_twilio_message',
                        help='Function to call')
    parser.add_argument('--to', type=str, required=True,
                        help='Recipient phone number')
    parser.add_argument('--body', type=str, required=True,
                        help='Message content')
    parser.add_argument('--media', type=str, default=None,
                        help='Media URLs as JSON string or "null"')
    
    return parser.parse_args()

if __name__ == "__main__":
    # Parse command line arguments
    args = parse_arguments()
    
    # Process media URLs if provided
    media_urls = None
    if args.media and args.media.lower() != 'null':
        try:
            media_urls = json.loads(args.media)
        except json.JSONDecodeError:
            print(f"Error: Invalid JSON format for media URLs: {args.media}")
            sys.exit(1)
    
    # Call the specified function
    if args.function == 'send_twilio_message':
        result = send_twilio_message(args.to, args.body, media_urls)
        print(json.dumps(result))
    else:
        print(f"Error: Unknown function: {args.function}")
        sys.exit(1)