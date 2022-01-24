const Joi = require('joi');
const fs = require('fs')

const appSchema = Joi.object({
    name: Joi.string().regex(/^(?=.{4,}$)[a-z0-9-]+$/).required(),
    runtime: Joi.string().valid('static', 'pm2').required(),
    working_dir: Joi.string().required(),
    git_remote_name: Joi.string().required(),
    git_remote_url: Joi.string().required(),
    git_branch: Joi.string().required(),
    webhook_secret: Joi.string().required(),
    pre_start: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string().allow("")),
    start: Joi.string().required(),
    post_start: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string().allow("")),
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
