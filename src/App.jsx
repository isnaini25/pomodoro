import { useEffect, useReducer, useRef } from 'react';

import './App.css';

// eslint-disable-next-line react/prop-types
function Count({ count, decrement, increment, type }) {
  return (
    <div className='count-handler'>
      <button onClick={decrement} id={type + '-decrement'}>
        -
      </button>
      <span id={type + '-length'}>{count}</span>
      <button onClick={increment} id={type + '-increment'}>
        +
      </button>
    </div>
  );
}

let initialState = {
  breakLength: 5,
  sessionLength: 25,
  minute: 25,
  second: 0,
  label: 'Session',
};

const clockReducer = (state, action) => {
  const decrement = (prev) => (prev - 1 <= 0 ? 1 : prev - 1);
  const increment = (prev) => (prev + 1 > 60 ? 60 : prev + 1);

  if (action.type === 'INCREMENT_BREAK') {
    return {
      ...state,
      breakLength: increment(state.breakLength),
    };
  }
  if (action.type === 'DECREMENT_BREAK') {
    return {
      ...state,
      breakLength: decrement(state.breakLength),
    };
  }
  if (action.type === 'INCREMENT_SESSION') {
    const sessionLength = increment(state.sessionLength);
    const minute = sessionLength;

    return {
      ...state,
      sessionLength,
      minute,
    };
  }
  if (action.type === 'DECREMENT_SESSION') {
    const sessionLength = decrement(state.sessionLength);
    const minute = sessionLength;
    return {
      ...state,
      sessionLength,
      minute,
    };
  }

  if (action.type === 'BREAK') {
    return {
      ...state,
      minute: state.breakLength,
      second: 0,
      label: 'Break',
    };
  }
  if (action.type === 'SESSION') {
    return {
      ...state,
      minute: state.sessionLength,
      second: 0,
      label: 'Session',
    };
  }
  if (action.type === 'START') {
    let second = state.second - 1 < 0 ? 59 : state.second - 1;
    let minute =
      second === 59
        ? state.minute - 1 < 0
          ? 0
          : state.minute - 1
        : state.minute;

    let label = state.label;

    if (state.minute - 1 < 0 && state.second - 1 < 0) {
      if (state.label === 'Session') {
        label = 'Break';
        minute = state.breakLength;
        second = 0;
      }
      if (state.label === 'Break') {
        label = 'Session';
        minute = state.sessionLength;
        second = 0;
      }
    }
    return {
      ...state,
      label,
      second,
      minute,
    };
  }
  if (action.type === 'RESET') {
    return initialState;
  }
};

function App() {
  const [clock, dispatchClock] = useReducer(clockReducer, initialState);

  const audioRef = useRef(null);
  const decrementSecond = useRef(null);
  const clockRef = useRef(null);

  const decrementBreakHandler = () => {
    dispatchClock({ type: 'DECREMENT_BREAK' });
  };

  const incrementBreakHandler = () => {
    dispatchClock({ type: 'INCREMENT_BREAK' });
  };
  const decrementSessionHandler = () => {
    dispatchClock({ type: 'DECREMENT_SESSION' });
  };

  const incrementSessionHandler = () => {
    dispatchClock({ type: 'INCREMENT_SESSION' });
  };

  const startSecond = () => {
    dispatchClock({ type: 'START' });
  };

  const starthandler = () => {
    if (!decrementSecond.current) {
      decrementSecond.current = setInterval(startSecond, 1000);
    }
  };

  const stop = (reset) => {
    clearInterval(decrementSecond.current);
    decrementSecond.current = null;
    if (reset) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      dispatchClock({ type: 'RESET' });
    }
  };

  useEffect(() => {
    if (clock.minute === 0 && clock.second === 0) {
      audioRef.current.play();
      clockRef.current.classList.remove('time-out');
    }
    if (clock.minute === 0 && clock.second < 60 && clock.second !== 0) {
      clockRef.current.classList.add('time-out');
    }
  }, [clock]);

  return (
    <>
      <h1>25 + 5 Clock</h1>
      <div id='timer-handler'>
        <div>
          <h2 id='break-label'>Break Length</h2>
          <Count
            count={clock.breakLength}
            decrement={decrementBreakHandler}
            increment={incrementBreakHandler}
            type='break'
          />
        </div>
        <div>
          <h2 id='session-label'>Session Length</h2>
          <Count
            count={clock.sessionLength}
            decrement={decrementSessionHandler}
            increment={incrementSessionHandler}
            type='session'
          />
        </div>
      </div>
      <div id='clock-timer' ref={clockRef}>
        <h2 id='timer-label'>{clock.label}</h2>
        <time id='time-left'>
          <span>{clock.minute < 10 ? '0' + clock.minute : clock.minute}</span>:
          <span>{clock.second < 10 ? '0' + clock.second : clock.second}</span>
        </time>
        <audio ref={audioRef} id='beep'>
          <source src='ringtone.wav' type='audio/wav' />
        </audio>
      </div>
      <div className='clock-action'>
        <button id='start' onClick={starthandler}>
          Start
        </button>
        <button id='start_stop' onClick={stop.bind(null, false)}>
          Pause
        </button>
        <button id='reset' onClick={stop.bind(null, true)}>
          Restart
        </button>
      </div>
    </>
  );
}

export default App;
