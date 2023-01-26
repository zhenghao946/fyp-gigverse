import { StyleSheet, Text } from "react-native";

export const UpcomingJobStatusRender = (text) => {
  if (text === 'scheduled')
    return <Text style={CustomStyles.upcomingJobStatusGreen}>Scheduled</Text>
  else if (text === 'insufficient info')
    return <Text style={CustomStyles.upcomingJobStatusRed}>Insufficient Info</Text>
  else if (text === 'pending payment')
    return <Text style={CustomStyles.upcomingJobStatusRed}>Pending Payment</Text>
  else if (text === 'completed')
    return <Text style={CustomStyles.upcomingJobStatusGreen}>Completed!</Text>
  else return <Text style={CustomStyles.upcomingJobStatusRed}>undefined</Text>
}

export const colors = {
  primary: '#5F266D',
  secondary: '#F7C606',
  background: '#f0f4ec',
  safe: '#67C657',
  warning: '#E2202C'
}

// TODO: new color palette : https://coolors.co/30343f-fafaff-e4d9ff-273469-1e2749

const CustomStyles = StyleSheet.create({
  heading1: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    width: '80%'
  },
  heading2: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    width: '80%',
    fontWeight: 'bold'
  },
  heading3: {
    color: '#fff',
    fontSize: 17
  },
  heading4: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  heading5: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '500'
  },
  heading6: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 17,
  },
  text: {
    color: 'black',
    fontSize: 14
  },
  hyperlinkGrey: {
    color: 'grey',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  defaultScreenView: {
    margin: 10,
  },
  profilePicThumbnail: {
    height: 100,
    width: 80,
    resizeMode: 'contain'
  },
  horizontalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  chatProfilePicThumbnail: {
    width: 60,
    height: 60
  },
  imagePreviewBottomSheet: {
    width: '100%',
    backgroundColor: 'white',
    padding: 5
  },
  fullSizeImage: {
    flex: 1,
    width: '100%',
    height: 200,
    resizeMode: 'contain'
  },
  centerView: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  defaultBottomSheet: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  jobInfoTag: {
    backgroundColor: 'black',
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginRight: 5,
    marginTop: 5,
    height: 30,
    textAlignVertical: 'center'
  },
  redText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: 'red',
  },
  hyperlinkText: {
    textDecorationLine: 'underline',
    fontSize: 15,
    color: colors.primary
  },
  abosuluteRight: {
    position: 'absolute',
    right: 0
  },
  defaultScreenPadding: {
    paddingHorizontal: 5,
    marginVertical: 10
  },
  infoTextLabel: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    height: 30,
    textAlignVertical: 'center',
  },
  infoTextContent: {
    color: 'black',
    position: 'absolute',
    left: 160,
    textAlignVertical: 'center',
    height: 30,
  },
  upcomingJobStatusGreen: {
    color: '#fff',
    position: 'absolute',
    left: 150,
    backgroundColor: 'green',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 2,
    alignSelf: 'center'
  },
  upcomingJobStatusRed: {
    color: '#fff',
    position: 'absolute',
    left: 150,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 2,
    alignSelf: 'center'
  },
  normalButton: {
    backgroundColor: colors.primary,
    width: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 35,
  },
  normalButtonText: {
    color: '#fff',
    fontSize: 15,
  },
  longFormInput: {
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 10,
    fontSize: 16,
    paddingHorizontal: 5
  },
  authStackScreen: {
    backgroundColor: '#547FAF',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default CustomStyles
