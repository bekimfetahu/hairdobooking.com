import React from 'react';

const HeadingThree = ({ children, className }) => {
    return (
        <h3 className={`text-xl sm:text-2xl font-medium text-gray-700 mb-2 ${className}`}>
            {children}
        </h3>
    );
};

export default HeadingThree;
