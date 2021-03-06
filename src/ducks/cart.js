import { connect as connectMQTT } from 'mqtt';
import _ from 'lodash';

const client = connectMQTT('ws://localhost:9001/mqtt');

export const FETCH_CART_START = 'cart/FETCH_CART_START';
export const FETCH_CART_END = 'cart/FETCH_CART_END';
export const CART_UPDATED = 'cart/CART_UPDATED';
export const FETCH_CART_SEND = 'cart/FETCH_CART_SEND';

const initialState = {
  cart: null,
  fetching: false,
  fetched: false,
  error: null,
  empty: true,
  newQuantity: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CART_START:
      return {
        ...state,
        fetching: true,
        fetched: false,
        newQuantity: action.gotNew
      };

    case FETCH_CART_END:
      return {
        ...state,
        cart: action.payload,
        fetched: true,
        fetching: false,
        newQuantity: action.gotNew
      };

    case FETCH_CART_SEND:
      let cart_text = _.get(state.cart, 'data');
      let cart_item = _.map(cart_text, 'sku').join(', ');

      client.publish('website_incoming', cart_item);

      return {
        ...state,
        fetched: true,
        fetching: false,
        newQuantity: action.gotNew
      };

    case CART_UPDATED:
      return {
        ...state,
        newQuantity: action.gotNew
      };

    default:
      return { ...state, newQuantity: false };
  }
};

export const fetchCartStart = () => ({
  type: FETCH_CART_START
});

export const fetchCartEnd = cart => ({
  type: FETCH_CART_END,
  payload: cart
});

export const fetchCartSend = cart => ({
  type: FETCH_CART_SEND,
  payload: cart
});

export const GetCartItems = () => (dispatch, getState, api) => {
  dispatch(fetchCartStart());

  return api.GetCartItems().then(cart => dispatch(fetchCartEnd(cart)));
};

export const addToCart = (productId, quantity) => (dispatch, getState, api) => {
  return api.AddCart(productId, quantity);
};
