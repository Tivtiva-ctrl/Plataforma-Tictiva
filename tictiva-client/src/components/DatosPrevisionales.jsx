const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  let finalValue;

  if (type === 'checkbox') {
    finalValue = checked;
  } else if (type === 'select-one') {
    if (value === 'true') finalValue = true;
    else if (value === 'false') finalValue = false;
    else finalValue = value;
  } else {
    finalValue = value;
  }

  const updated = {
    ...previsionalData,
    [name]: finalValue,
  };

  onChange && onChange(updated);
};
