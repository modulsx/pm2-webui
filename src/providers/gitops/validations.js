const Joi = require('joi');
const fs = require('fs')

const appSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('frontend', 'backend').required(),
    path: Joi.string().required(),
    git_remote: Joi.string().required(),
    git_branch: Joi.string().required(),
    webhook_secret: Joi.string().required(),
    exec_commands: Joi.array().items(Joi.string())
})

const deployHooksSchema = Joi.object({
    apps: Joi.array().items(appSchema).required(),
})

const getValidatedDeploymentsConfig =  async (jsonFile) => {
    const deploymentsConfigFile = await fs.promises.readFile(jsonFile, 'utf8');
    const deploymentsConfigJson = JSON.parse(deploymentsConfigFile)
    return deployHooksSchema.validateAsync(deploymentsConfigJson)
}

const getValidatedDeploymentsConfigSync = (jsonFile) => {
    const deploymentsConfigFile = fs.readFileSync(jsonFile, 'utf8')
    const deploymentsConfigJson = JSON.parse(deploymentsConfigFile)
    const { error, value }  = deployHooksSchema.validate(deploymentsConfigJson)
    if(error){
        throw new Error(`Deployments Config Validation Error: ${error.message}`)
    }
    return value
}

module.exports = {
    getValidatedDeploymentsConfig,
    getValidatedDeploymentsConfigSync
}
