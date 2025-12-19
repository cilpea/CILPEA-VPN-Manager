import { ConnectionStatus } from '../types';

// In a real scenario, these would fetch from the Flask API (e.g., http://localhost:3000/connect)
// We are simulating the network calls to provide a functional UI experience.

export const connectVpn = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 2000);
  });
};

export const disconnectVpn = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1500);
  });
};

export const fetchVpnStatus = async (): Promise<ConnectionStatus> => {
  // Mock status check
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ConnectionStatus.DISCONNECTED);
    }, 500);
  });
};