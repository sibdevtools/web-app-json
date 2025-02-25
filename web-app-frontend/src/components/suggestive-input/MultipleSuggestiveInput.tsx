import React, { useEffect, useRef, useState } from 'react';
import { Form, FormControl, ListGroup } from 'react-bootstrap';
import './SuggestiveInput.css';

export interface MultipleSuggestiveItem {
  key: string;
  value: string;
  data?: any;
}

interface MultipleSuggestiveInputProps {
  id?: string;
  values?: string[];
  suggestions: MultipleSuggestiveItem[];
  maxSuggestions?: number;
  itemsToScroll?: number;
  onFilter?: (input: string) => MultipleSuggestiveItem[];
  onChange: (value: MultipleSuggestiveItem[]) => void;
  placeholder?: string;
  required: boolean;
  disabled?: boolean;
  clarifyText?: string;
}

const MultipleSuggestiveInput: React.FC<MultipleSuggestiveInputProps> = ({
                                                                           id,
                                                                           values,
                                                                           suggestions,
                                                                           maxSuggestions = 5,
                                                                           itemsToScroll = 5,
                                                                           onFilter,
                                                                           onChange,
                                                                           placeholder,
                                                                           required,
                                                                           disabled,
                                                                           clarifyText = 'Clarify request'
                                                                         }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedValues, setSelectedValues] = useState(new Set<string>(values));
  const [filteredSuggestions, setFilteredSuggestions] = useState<MultipleSuggestiveItem[]>(
    suggestions.slice(
      0,
      maxSuggestions
    )
  );
  const [filteredSliced, setFilteredSliced] = useState(suggestions.length > filteredSuggestions.length);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>();
  const [dropdownLocation, setDropdownLocation] = useState<{ left: number, top: number } | undefined>();

  if (!onFilter) {
    onFilter = it => {
      const substring = it.toLowerCase();
      return suggestions.filter(it => it.value.includes(substring));
    };
  }

  useEffect(() => {
    setSelectedValues(new Set<string>(values));
  }, [values]);

  useEffect(() => {
    const filtered = onFilter(inputValue);
    if (filtered.length === 0) {
      setFilteredSuggestions(suggestions.slice(0, maxSuggestions));
      return
    }
    const sliced = filtered.slice(0, maxSuggestions);
    setFilteredSuggestions(sliced)
  }, [suggestions]);

  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement) {
      return;
    }
    setDropdownWidth(inputElement.offsetWidth);
    setDropdownLocation({ top: inputElement.offsetTop + inputElement.offsetHeight, left: inputElement.offsetLeft })
  }, [inputRef?.current?.offsetWidth, inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value)

    const filtered = onFilter(value);
    const sliced = filtered.slice(0, maxSuggestions);
    setFilteredSuggestions(sliced);
    setFilteredSliced(filtered.length > sliced.length);

    setShowSuggestions(sliced.length > 0);
  };

  return (
    <>
      <FormControl
        ref={inputRef}
        id={id}
        type={'text'}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder ?? Array.from(selectedValues).join(", ")}
        required={required}
        disabled={disabled}
      />
      {showSuggestions && (
        <div
          className="suggestions-dropdown"
          style={{ width: dropdownWidth, top: dropdownLocation?.top, left: dropdownLocation?.left }}
        >
          <ListGroup style={{ maxHeight: `${itemsToScroll * 32}px`, overflowY: 'auto' }}>
            {filteredSuggestions.map((suggestion) => (
              <ListGroup.Item
                key={suggestion.key}
                className="suggestion-item"
                onMouseDown={e => {
                  e.preventDefault();
                  if (selectedValues.has(suggestion.key)) {
                    selectedValues.delete(suggestion.key);
                  } else {
                    setSelectedValues(selectedValues.add(suggestion.key))
                  }
                  onChange(suggestions.filter(it => selectedValues.has(it.key)))
                }}
              >
                <Form.Check
                  type="checkbox"
                  label={suggestion.value}
                  checked={selectedValues.has(suggestion.key)}
                />
              </ListGroup.Item>
            ))}
            {filteredSliced && (
              <ListGroup.Item
                key={'other-options'}
                className="suggestion-text text-secondary"
              >
                {clarifyText}
              </ListGroup.Item>
            )}
          </ListGroup>
        </div>
      )}
    </>
  );
};

export default MultipleSuggestiveInput;
