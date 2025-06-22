import twilio from 'twilio';

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  throw new Error("Twilio credentials must be set: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER");
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

interface CallOptions {
  to: string;
  message: string;
  callback?: string;
}

export class TwilioService {
  static async makeCall(options: CallOptions): Promise<{
    success: boolean;
    callSid?: string;
    duration?: string;
    status?: string;
    error?: string;
  }> {
    try {
      const call = await client.calls.create({
        to: options.to,
        from: process.env.TWILIO_PHONE_NUMBER!,
        twiml: `<Response><Say voice="alice">${options.message}</Say></Response>`,
        statusCallback: options.callback,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        record: false,
        timeout: 30
      });

      console.log(`Call initiated to ${options.to}, SID: ${call.sid}`);

      return {
        success: true,
        callSid: call.sid,
        status: call.status,
        duration: call.duration || '0'
      };
    } catch (error) {
      console.error('Twilio call failed:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  static async getCallStatus(callSid: string): Promise<{
    status: string;
    duration?: string;
    startTime?: string;
    endTime?: string;
  }> {
    try {
      const call = await client.calls(callSid).fetch();
      
      return {
        status: call.status,
        duration: call.duration || '0',
        startTime: call.startTime?.toISOString(),
        endTime: call.endTime?.toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch call status:', error);
      return {
        status: 'unknown'
      };
    }
  }

  static async sendSMS(to: string, message: string): Promise<{
    success: boolean;
    messageSid?: string;
    error?: string;
  }> {
    try {
      const sms = await client.messages.create({
        to,
        from: process.env.TWILIO_PHONE_NUMBER!,
        body: message
      });

      return {
        success: true,
        messageSid: sms.sid
      };
    } catch (error) {
      console.error('Twilio SMS failed:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
}