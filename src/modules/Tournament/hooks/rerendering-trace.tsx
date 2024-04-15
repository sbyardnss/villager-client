import { useEffect, useRef } from 'react';

export const useRenderingTrace = (componentName: string, propsAndStates: any, level: 'debug' | 'info' | 'log' = 'debug') => {
  const prev = useRef(propsAndStates);
  // console.log('it did run tho')
  useEffect(() => {
    const changedProps: { [key: string]: { old: any, new: any } } = Object.entries(propsAndStates).reduce((property: any, [key, value]: [string, any]) => {
      if (prev.current[key] !== value) {
        property[key] = {
          old: prev.current[key],
          new: value,
        };
      }
      return property;
    }, {});

    if (Object.keys(changedProps).length > 0) {
      console[level](`[${componentName}] Changed props:`, changedProps);
    }

    prev.current = propsAndStates;
  });
};

// export default useRenderingTrace;