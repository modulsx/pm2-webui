const Joi = require('joi');
const HOME_DIR = require('os').homedir();
const fs = require('fs')

const appSchema = Joi.object({
    name: Joi.string().regex(/^(?=.{4,}$)[a-z0-9-]+$/).required(),
    runtime: Joi.string().valid('static', 'pm2').required(),
    deploy_path: Joi.string().default(HOME_DIR),
    git_remote_url: Joi.string().required(),
    git_branch: Joi.string().required(),
    autodeploy: Joi.boolean().default(false),
    webhook_secret: Joi.string().when('autodeploy', { is: true, then: Joi.required()}),
    build_command: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string().allow("")),
    start_command: Joi.string().when('runtime', { is: 'pm2', then: Joi.required()})
})

const deployHooksSchema = Joi.object({
    apps: Joi.array().unique('name').items(appSchema).required(),
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
