import { StyleSheet, Text } from 'react-native'
import React, { useState } from 'react'
import { ListItem, Button } from '@rneui/base'
import CustomStyles from '../styles'

const FormikDropDown = ({ formikProps, label, itemArray, defaultValue, value, customContainerStyling }) => {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <Text style={CustomStyles.heading6}>{label}</Text>
      <ListItem.Accordion
        containerStyle={[styles.dropDownContainer, customContainerStyling]}
        content={
          <ListItem.Content>
            <ListItem.Title>
              {(formikProps.values[value] == '' || formikProps.values[value] == null) ? <Text style={styles.placeHolder}>{defaultValue}</Text> : formikProps.values[value]}
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
                    if (l === 'No Bidding') formikProps.setFieldValue(value, 0)
                    else formikProps.setFieldValue(value, l)
                    setExpanded(false)
                  }}
                >
                  {l.toString()}
                </Button>
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
        ))}
      </ListItem.Accordion>
      {(formikProps.touched[value] && formikProps.errors[value]) &&
        <Text style={{ color: 'red', fontSize: 15 }}>{formikProps.errors[value]}</Text>
      }
    </>
  )
}

export default FormikDropDown

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
    fontSize: 15,
  },
})