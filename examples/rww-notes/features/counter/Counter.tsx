import React, { useState } from 'react';

import { useAppDispatch } from '../../app/hooks';
import {
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
  incrementIfOdd,
} from './counterMutates';
import styles from './Counter.module.css';
import { useRead } from 'read-write-web3';
import { unwrapResult } from '@reduxjs/toolkit';

type Counter = {
  id: string;
  path: string;
  amount: number;
};

export function Counter() {
  const dispatch = useAppDispatch();
  const [incrementAmount, setIncrementAmount] = useState('2');
  const [transactionStatus, setTransactionStatus] = useState('Add Async');

  /* return partial docs */
  const counters = useRead<Counter>(
    {
      path: 'counter',
      where: ['amount', '>', 0],
    },
    ['amount'],
  );
  const [{ amount: counter } = { amount: -1 }] = counters || [];

  // /* return single values */
  // const counters = useRead<Counter>(
  //   {
  //     path: 'counter',
  //     where: ['amount', '>', 0],
  //   },
  //   'amount',
  // );
  // const [counter = 0] = counters || [];

  // /* return single doc value */
  // const counters = useRead<Counter>(
  //   {
  //     path: 'counter',
  //     id: 'global',
  //   },
  //   'amount',
  // );
  // const counter = counters || 0;

  // /* return full single doc */
  // const counters = useRead<Counter>({
  //   path: 'counter',
  //   id: 'global',
  // });
  // const { amount: counter } = counters || { amount: 0 };

  // /* return single doc */
  // const counterDoc = useRead<Counter>(
  //   {
  //     path: 'counter',
  //     id: 'global',
  //   },
  //   ['amount'],
  // );
  // const { amount: counter } = counterDoc || { amount: 0 };

  // /* return alias */
  // const alias = useRead(
  //   {
  //     path: 'counter',
  //     where: ['amount', '>', 0],
  //   },
  //   '::alias',
  // );
  // const counterDocs = useRead<Counter>(alias);
  // const [{ amount: counter } = { amount: 0 }] = counterDocs || [];

  const incrementValue = Number(incrementAmount) || 0;

  return (
    <div>
      <div className={styles.row}>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={() => dispatch(decrement(null)).catch(console.error)}
        >
          -
        </button>
        <span className={styles.value}>{counter}</span>
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={() => dispatch(increment(null)).catch(console.error)}
        >
          +
        </button>
      </div>
      <div className={styles.row}>
        <input
          className={styles.textbox}
          aria-label="Set increment amount"
          value={incrementAmount}
          onChange={(e) => setIncrementAmount(e.target.value)}
        />
        <button
          className={styles.button}
          onClick={() =>
            dispatch(incrementByAmount(incrementValue)).catch(console.error)
          }
        >
          Add Amount
        </button>
        <button
          className={styles.asyncButton}
          onClick={() => {
            setTransactionStatus('Sending');
            dispatch(incrementAsync(incrementValue))
              .then(unwrapResult)
              .then(() => {
                setTransactionStatus('Saved');
                setTimeout(() => setTransactionStatus('Add Async'), 1000);
              })
              .catch(() => setTransactionStatus('error'));
          }}
        >
          {transactionStatus}
        </button>
        <button
          className={styles.button}
          onClick={() => dispatch(incrementIfOdd(incrementValue))}
        >
          Add If Odd
        </button>
      </div>
    </div>
  );
}
