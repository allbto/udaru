'use strict'

const expect = require('code').expect
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Boom = require('boom')
var proxyquire = require('proxyquire')

var policyOps = {}
var policiesRoutes = proxyquire('./../../../routes/public/policies', { './../../lib/policyOps': () => policyOps })
var server = proxyquire('./../../../wiring-hapi', { './routes/public/policies': policiesRoutes })

lab.experiment('Policies', () => {
  lab.test('get policy list', (done) => {
    const policyListStub = [{
      id: 1,
      name: 'SysAdmin',
      version: '0.1'
    }, {
      id: 2,
      name: 'Developer',
      version: '0.2'
    }]

    policyOps.listAllPolicies = (params, cb) => {
      cb(null, policyListStub)
    }

    const options = {
      method: 'GET',
      url: '/authorization/policies'
    }

    server.inject(options, (response) => {
      const result = response.result

      expect(response.statusCode).to.equal(200)
      expect(result).to.equal(policyListStub)

      done()
    })
  })

  lab.test('get policy list should return error for error case', (done) => {
    policyOps.listAllPolicies = (params, cb) => {
      process.nextTick(() => {
        cb(Boom.badImplementation())
      })
    }

    const options = {
      method: 'GET',
      url: '/authorization/policies'
    }

    server.inject(options, (response) => {
      const result = response.result

      expect(response.statusCode).to.equal(500)
      expect(result).to.be.undefined

      done()
    })
  })

  lab.test('get single policy', (done) => {
    const policyStub = {
      id: 1,
      name: 'SysAdmin',
      version: '0.1',
      statements: [{
        'Statement': [
          {
            'Action': [
              'finance:ReadBalanceSheet'
            ],
            'Effect': 'Allow',
            'Resource': [
              'database:pg01:balancesheet'
            ]
          },
          {
            'Action': [
              'finance:ImportBalanceSheet'
            ],
            'Effect': 'Deny',
            'Resource': [
              'database:pg01:balancesheet'
            ]
          }
        ]
      }]
    }

    policyOps.readPolicyById = (params, cb) => {
      process.nextTick(() => {
        cb(null, policyStub)
      })
    }

    const options = {
      method: 'GET',
      url: '/authorization/policy/1'
    }

    server.inject(options, (response) => {
      const result = response.result

      expect(response.statusCode).to.equal(200)
      expect(result).to.equal(policyStub)

      done()
    })
  })

  lab.test('get single policy should return error for error case', (done) => {
    policyOps.readPolicyById = (params, cb) => {
      process.nextTick(() => {
        cb(Boom.badImplementation())
      })
    }
    const options = {
      method: 'GET',
      url: '/authorization/policy/99'
    }

    server.inject(options, (response) => {
      const result = response.result

      expect(response.statusCode).to.equal(500)
      expect(result).to.be.undefined

      done()
    })
  })
})
