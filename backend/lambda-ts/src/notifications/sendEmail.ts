import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { ok, error } from '../utils/response';

const ses = new SESClient({ region: process.env.AWS_REGION || 'sa-east-1' });
const BARBERSHOP_EMAIL = process.env.BARBERSHOP_EMAIL || '';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { name, phoneNumber, barberName, serviceName, date, time } = body;

    if (!name || !phoneNumber || !barberName || !serviceName || !date || !time) {
      return error(400, 'Missing required fields');
    }

    if (!BARBERSHOP_EMAIL) {
      return error(500, 'Email configuration missing');
    }

    const emailParams = {
      Source: BARBERSHOP_EMAIL,
      Destination: {
        ToAddresses: [BARBERSHOP_EMAIL],
      },
      Message: {
        Subject: {
          Data: 'Novo Agendamento Confirmado',
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: `Novo agendamento confirmado:\n\n` +
              `Nome: ${name}\n` +
              `Telefone: ${phoneNumber}\n` +
              `Barbeiro: ${barberName}\n` +
              `Serviço: ${serviceName}\n` +
              `Data: ${date}\n` +
              `Horário: ${time}`,
            Charset: 'UTF-8',
          },
          Html: {
            Data: `
              <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                  <h2 style="color: #b8860b;">Novo Agendamento Confirmado</h2>
                  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
                    <p><strong>👤 Nome:</strong> ${name}</p>
                    <p><strong>📞 Telefone:</strong> ${phoneNumber}</p>
                    <p><strong>✂️ Barbeiro:</strong> ${barberName}</p>
                    <p><strong>💈 Serviço:</strong> ${serviceName}</p>
                    <p><strong>📅 Data:</strong> ${date}</p>
                    <p><strong>🕐 Horário:</strong> ${time}</p>
                  </div>
                </body>
              </html>
            `,
            Charset: 'UTF-8',
          },
        },
      },
    };

    await ses.send(new SendEmailCommand(emailParams));

    return ok({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('Error sending email:', err);
    return error(500, 'Failed to send email');
  }
};
