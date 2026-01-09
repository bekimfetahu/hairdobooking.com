import React from 'react';

const HeadingTwo = ({ children }) => {
    return (
        <h3 className="text-2xl sm:text-3xl font-medium text-gray-800 mb-2">
            {children}
        </h3>
    );
};

export default HeadingTwo;
