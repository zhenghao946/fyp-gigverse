import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import BASE_URL from '../screens/BASE_URL';
import EncryptedStorage from 'react-native-encrypted-storage';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const InitializeSocket = async () => {
      let userToken = await EncryptedStorage.getItem('userToken')
      setSocket(io(`${BASE_URL}`, {
        // autoConnect: false,
        transports: ['websocket'],
        extraHeaders: {
          Authorization: `Bearer ${userToken}`
        }
      }))
    }
    InitializeSocket()
    // return () => {
    //   // disconnect the socket when the component using this hook unmount
    //   socket.disconnect()
    // }
  }, []);

  return socket;
}
