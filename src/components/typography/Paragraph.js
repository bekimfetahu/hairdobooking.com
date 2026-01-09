import React from 'react';
import PropTypes from 'prop-types';

const Paragraph = ({ children, className }) => {
    return (
        <p
            className={`text-lg sm:text-xl font-sans text-foreground leading-relaxed ${className}`}
        >
            {children}
        </p>
    );
};


Paragraph.propTypes = {
    children: PropTypes.node.isRequired, // Ensures the component gets content
    className: PropTypes.string,         // Allows for optional Tailwind classes
};

Paragraph.defaultProps = {
    className: '',                       // Default is no additional styles
};

export default Paragraph;
