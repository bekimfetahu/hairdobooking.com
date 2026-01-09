import React from 'react';

const Title = ({ children }) => {
    return (
        <h1 className="text-3xl sm:text-4xl font-semibold text-secondary mb-3 text-gray-800">
            {children}
        </h1>
    );
};

export default Title;
