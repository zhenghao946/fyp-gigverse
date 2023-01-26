import { Modal, TouchableOpacity } from 'react-native'
import React from 'react'
import { WebView } from 'react-native-webview';

const Browser = ({ visible, onRequestClose }) => {

  return (
    <Modal
      visible={visible}
      onRequestClose={onRequestClose()}
      transparent
      presentationStyle='slide'
    >
      <TouchableOpacity
        onPress={() => setVisible(false)}
        style={{ position: 'absolute', top: 100 }}
      >
        <Text>x</Text>
      </TouchableOpacity>
      <WebView
        source={{ uri: 'https://www.billplz-sandbox.com/bills/r2yqfjfw' }}
        onLoadStart={() => (<Text>hi</Text>)}
      />

    </Modal>

  )
}

export default Browser