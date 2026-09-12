import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Heading } from '@react-email/components';

interface ActivityAlertProps {
  recipientName: string;
  eventType: string;
  transactionId: string;
  amount: string;
  type: string;
  status: string;
  timestamp: string;
}

export default function ActivityAlert({
  recipientName = "User",
  eventType = "TRANSACTION_CREATED",
  transactionId = "tx_123",
  amount = "0.00",
  type = "CREDIT",
  status = "PENDING",
  timestamp = new Date().toISOString()
}: ActivityAlertProps) {
  return (
    <Html>
      <Head />
      <Preview>New Activity: {eventType}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Secure Transaction System</Heading>
          <Text style={text}>Hello {recipientName},</Text>
          <Text style={text}>A new activity has been recorded on your account: <strong>{eventType}</strong></Text>
          <Section style={detailsContainer}>
            <Text style={detailsText}><strong>Transaction ID:</strong> {transactionId}</Text>
            <Text style={detailsText}><strong>Type:</strong> {type}</Text>
            <Text style={detailsText}><strong>Amount:</strong> ${amount}</Text>
            <Text style={detailsText}><strong>Status:</strong> {status}</Text>
            <Text style={detailsText}><strong>Time:</strong> {timestamp}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px' };
const h1 = { color: '#333', fontSize: '24px', fontWeight: 'bold', padding: '0 48px' };
const text = { color: '#555', fontSize: '16px', padding: '0 48px' };
const detailsContainer = { backgroundColor: '#f4f4f4', padding: '24px', margin: '0 48px', borderRadius: '4px' };
const detailsText = { color: '#333', fontSize: '14px', margin: '4px 0' };
