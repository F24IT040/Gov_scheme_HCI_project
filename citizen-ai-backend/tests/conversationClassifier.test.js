import test from 'node:test';
import assert from 'node:assert/strict';
import { isConversationalEligibilityQuestion } from '../services/conversationClassifier.js';

test('classifies eligibility-style conversational questions as conversational', () => {
  assert.equal(isConversationalEligibilityQuestion('can i apply if i am obc student'), true);
  assert.equal(isConversationalEligibilityQuestion('am i eligible for this scheme if i am from obc'), true);
  assert.equal(isConversationalEligibilityQuestion('can i get a scholarship if i am a student'), true);
});

test('classifies definition questions as conversational', () => {
  assert.equal(isConversationalEligibilityQuestion('What is scholarship?'), true);
  assert.equal(isConversationalEligibilityQuestion('Explain health insurance'), true);
  assert.equal(isConversationalEligibilityQuestion('Tell me about student loans'), true);
});

test('keeps direct browse requests as scheme queries', () => {
  assert.equal(isConversationalEligibilityQuestion('show me scholarship schemes for students'), false);
  assert.equal(isConversationalEligibilityQuestion('find me schemes related to farming'), false);
});
