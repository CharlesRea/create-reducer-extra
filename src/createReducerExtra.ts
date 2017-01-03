import assign = require('lodash.assign')
import { Action, Reducer } from 'redux'

export interface StandardAction<P> extends Action { payload?: P }

export type Partial<S> = { [T in keyof S]?: S[T] }
export type Readonly<S> = { readonly [T in keyof S]: S[T] }

export type PartialPayloadReducer<S, P> = (state: Readonly<S>, payload:P) => Partial<S>
export type PayloadReducer<S, P> = (state: Readonly<S>, payload:P) => S

export interface ActionHandler<S, P> { [actionType: string]: PayloadReducer<S, P> }
export interface PartialActionHandler<S, P> { [actionType: string]: PartialPayloadReducer<S, P> }

// Allows the reducer to only return what has changed, rather than having to list every single key of the state object
export const createMergeReducer = <S, P>(initialState: S, handler: PartialActionHandler<S, P>): Reducer<S> =>
  (state: Readonly<S> = initialState, { payload, type }: StandardAction<any>): S => {
    if (handler.hasOwnProperty(type)) {
      const changedState: Partial<S> = handler[type](state, payload)
      return assign({}, state, changedState)
    }
    return state
  }

export const createReducer = <S, P>(initialState: S, handler: ActionHandler<S, P>): Reducer<S> =>
  (state: Readonly<S> = initialState, { payload, type }: StandardAction<any>): S => {
    if (handler.hasOwnProperty(type)) {
      return handler[type](state, payload)
    }
    return state
  }

// Allows the state to be 'reset' to the initialState once a particular action is received.
// This action can be handled by the actionHandler to override this.
export const createResetMergeReducer = <S, P>(initialState: S, handler: PartialActionHandler<S, P>): Reducer<S> =>
  (state: Readonly<S> = initialState, { payload, type }: StandardAction<any>): S => {
    if (handler.hasOwnProperty(type)) {
      const changedState: Partial<S> = handler[type](state, payload)
      return assign({}, state, changedState)
    } else if(type === ResetState) {
      return initialState
    }
    return state
  }

export const ResetState = '__create-reducer-extra-reset-state__'
export const createResettableReducer = <S, P>(initialState: S, handlers: ActionHandler<S, P>): Reducer<S> =>
  (state: Readonly<S> = initialState, { payload, type }: StandardAction<any>): S => {
    if (handlers.hasOwnProperty(type)) {
      return handlers[type](state, payload)
    } else if (type === ResetState) {
      return initialState
    }
    return state
  }
