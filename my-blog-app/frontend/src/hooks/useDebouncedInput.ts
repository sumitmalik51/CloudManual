import { useState, useEffect, useCallback } from 'react';

interface UseDebouncedInputOptions {
  delay?: number;
  onChange?: (value: string) => void;
}

export const useDebouncedInput = (
  initialValue: string = '',
  options: UseDebouncedInputOptions = {}
) => {
  const { delay = 300, onChange } = options;
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isTyping, setIsTyping] = useState(false);

  // Update the debounced value after delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsTyping(false);
      onChange?.(value);
    }, delay);

    // Set typing state immediately when value changes
    if (value !== debouncedValue) {
      setIsTyping(true);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, onChange, debouncedValue]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  }, []);

  const reset = useCallback(() => {
    setValue('');
    setDebouncedValue('');
    setIsTyping(false);
  }, []);

  return {
    value,
    debouncedValue,
    isTyping,
    onChange: handleChange,
    setValue,
    reset
  };
};

export default useDebouncedInput;
