import React from 'react';export function Textarea(props: any){ return <textarea {...props} className={'border px-2 py-2 rounded w-full '+(props.className||'')} />; }
