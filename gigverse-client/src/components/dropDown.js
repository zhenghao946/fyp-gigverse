import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { ListItem, Button } from '@rneui/base'
import CustomStyles from '../styles'

const DropDown = ({ label, itemArray, defaultValue, value, setValue, customContainerStyling, isMap = false, dataMap, itemName }) => {


  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <Text style={CustomStyles.heading6}>{label}</Text>
      <ListItem.Accordion
        containerStyle={[styles.dropDownContainer, customContainerStyling]}
        content={
          <ListItem.Content>
            <ListItem.Title>
              {(value == '' || value == null) ? <Text style={styles.placeHolder}>{defaultValue}</Text> : value}
            </ListItem.Title>
          </ListItem.Content>
        }
        isExpanded={expanded}
        onPress={() => { setExpanded(!expanded) }}
      >
        {itemArray.map((l, i) => (
          <ListItem key={i} bottomDivider>
            <ListItem.Content>
              <ListItem.Title>
                <Button
                  onPress={() => {
                    (isMap === false ? setValue(l)
                      : setValue({ ...dataMap, [itemName]: l }))
                    setExpanded(false)
                  }}>
                  {l.toString()}
                </Button>
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
        ))}
      </ListItem.Accordion>
    </>
  )
}

export default DropDown

const styles = StyleSheet.create({
  dropDownContainer: {
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    height: 50,
    width: '100%',
    paddingTop: 13,
    paddingHorizontal: 5
  },
  placeHolder: {
    color: 'grey',
    fontSize: 17,
  },
  dropDownLabel: {
    color: "black",
    fontSize: 20,
    fontWeight: 'bold',

  },
})