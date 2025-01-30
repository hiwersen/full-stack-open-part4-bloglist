const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
    const actual = listHelper.dummy([])
    const expected = 1
    assert.strictEqual(actual, expected)
})
