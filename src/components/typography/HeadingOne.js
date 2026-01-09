import React from 'react';

const HeadingOne = ({ children }) => {
    return (
        <h2 className="text-3xl sm:text-4xl font-semibold text-secondary mb-3">
            {children}
        </h2>
    );
};

export default HeadingOne;
