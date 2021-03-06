import assign = require('lodash.assign')
import { Action, Reducer } from 'redux'

export type StandardAction<P> = Action & { payload?: P }

export type Readonly<S> = { readonly [T in keyof S]: S[T] }

// tslint:disable:no-any TODO is there a convenient way to type the payloads?
export type PartialPayloadReducer<S> = (state: Readonly<S>, payload: any) => Partial<S>
export type PayloadReducer<S> = (state: Readonly<S>, payload: any) => S

export type ActionHandler<S> = { [actionType: string]: PayloadReducer<S> }
export type PartialActionHandler<S> = { [actionType: string]: PartialPayloadReducer<S> }

// Allows the reducer to only return what has changed, rather than having to list every single key of the state object
export const createMergeReducer = <S>(initialState: S, handler: PartialActionHandler<S>): Reducer<S> =>
  (state: Readonly<S> = initialState, { payload, type }: StandardAction<any>): S => {
    if (handler.hasOwnProperty(type)) {
      const changedState: Partial<S> = handler[type](state, payload)
      return assign({}, state, changedState)
    }
    return state
  }

export const createReducer = <S, P>(initialState: S, handler: ActionHandler<S>): Reducer<S> =>
  (state: Readonly<S> = initialState, { payload, type }: StandardAction<any>): S => {
    if (handler.hasOwnProperty(type)) {
      return handler[type](state, payload)
    }
    return state
  }

// Allows the state to be 'reset' to the initialState once a particular action is received.
// This action can be handled by the actionHandler to override this.
export const createResetMergeReducer = <S>(initialState: S, handler: PartialActionHandler<S>): Reducer<S> =>
  (state: Readonly<S> = initialState, { payload, type }: StandardAction<any>): S => {
    if (handler.hasOwnProperty(type)) {
      const changedState: Partial<S> = handler[type](state, payload)
      return assign({}, state, changedState)
    } else if (type === ResetState) {
      return initialState
    }
    return state
  }

export const ResetState = '__create-reducer-extra-reset-state__'
export const createResettableReducer = <S>(initialState: S, handlers: ActionHandler<S>): Reducer<S> =>
  (state: Readonly<S> = initialState, { payload, type }: StandardAction<any>): S => {
    if (handlers.hasOwnProperty(type)) {
      return handlers[type](state, payload)
    } else if (type === ResetState) {
      return initialState
    }
    return state
  }
