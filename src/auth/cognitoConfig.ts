import { CognitoUserPool } from 'amazon-cognito-identity-js';

export const USER_POOL_ID = 'ap-south-1_LGEdrQcQM';
export const CLIENT_ID = '7g2us5oe34j34t632v289pm08e';
export const REGION = 'ap-south-1';

export const userPool = new CognitoUserPool({
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
});
