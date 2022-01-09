const prompts = require('prompts');
const config = require('../config')
const { createAdminUser } = require('../services/admin.service')

const username_regex = /^(?=.{4,}$)[a-z0-9_]+$/
const password_regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/

const questions = [
  {
    type: 'text',
    name: 'username',
    message: 'App Username',
    validate: value => {
      value  = value.trim()
      if(!value){
        return 'App username is required'
      }
      else if(value.length < 4){
        return 'App username must have atleast 4 characters'
      }
      else if(!username_regex.test(value)){
        return 'App username can only contain Lowercase letters (a-z), Numbers (0-9) and Underscores (_)'
      }
      return true
    }
  },
  {
    type: 'password',
    name: 'password',
    message: 'App Password',
    validate: value => {
      if(!value){
        return 'App password is required'
      }
      else if(value.length < 4){
        return 'App username must have mininum 8 characters'
      }
      else if(!password_regex.test(value)){
        return 'App username must contain at least a symbol, upper and lower case letters and a number'
      }
      return true
    }
  },
  {
    type: 'confirm',
    name: 'agreed',
    message: 'Confirm to create/update admin user ?',
  }
];

const onCancel = prompt => {
  console.log('Bye Bye!');
}

(async () => {
  const response = await prompts(questions, { onCancel });
  if(response.agreed){
    createAdminUser(response.username, response.password)
  }
})();