import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilterBar from '../FilterBar';

describe('FilterBar', () => {
    const mockProps = {
        location: '',
        onLocationChange: jest.fn(),
        propertyType: '',
        onPropertyTypeChange: jest.fn(),
        priceRange: '',
        onPriceRangeChange: jest.fn(),
        onSearch: jest.fn(),
        isLoading: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all filter inputs', () => {
        render(<FilterBar {...mockProps} />);

        expect(screen.getByPlaceholderText('Location')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Type')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Price Range')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('calls onLocationChange when location input changes', () => {
        render(<FilterBar {...mockProps} />);

        const locationInput = screen.getByPlaceholderText('Location');
        fireEvent.change(locationInput, { target: { value: 'Nairobi' } });

        expect(mockProps.onLocationChange).toHaveBeenCalledWith('Nairobi');
    });

    it('calls onPropertyTypeChange when property type changes', () => {
        render(<FilterBar {...mockProps} />);

        const typeSelect = screen.getByDisplayValue('Type');
        fireEvent.change(typeSelect, { target: { value: 'Apartment' } });

        expect(mockProps.onPropertyTypeChange).toHaveBeenCalledWith('Apartment');
    });

    it('calls onPriceRangeChange when price range changes', () => {
        render(<FilterBar {...mockProps} />);

        const priceSelect = screen.getByDisplayValue('Price Range');
        fireEvent.change(priceSelect, { target: { value: '1000-2000' } });

        expect(mockProps.onPriceRangeChange).toHaveBeenCalledWith('1000-2000');
    });

    it('calls onSearch when search button is clicked', () => {
        render(<FilterBar {...mockProps} />);

        const searchButton = screen.getByRole('button', { name: /search/i });
        fireEvent.click(searchButton);

        expect(mockProps.onSearch).toHaveBeenCalled();
    });

    it('shows loading state when isLoading is true', () => {
        render(<FilterBar {...mockProps} isLoading={true} />);

        const searchButton = screen.getByRole('button');
        expect(searchButton).toBeDisabled();
        expect(screen.getByText('Searching...')).toBeInTheDocument();
    });

    it('displays all property type options', () => {
        render(<FilterBar {...mockProps} />);

        // Check if all options are present by looking for option elements
        expect(screen.getByRole('option', { name: 'Type' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Bedsitter' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Singles' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Apartment' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Condo' })).toBeInTheDocument();
    });

    it('displays all price range options', () => {
        render(<FilterBar {...mockProps} />);

        expect(screen.getByRole('option', { name: 'Price Range' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Under 1000' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: '1000 - 2000' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: '2000 - 3000' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: '3000+' })).toBeInTheDocument();
    });
});