export const determineSeverity = (issue: string, description: string): string => {
    const desc = description.toLowerCase();

    if (issue === 'Crack') {
        if (desc.includes('wide') || desc.includes('structural') || desc.includes('deep')) return 'Immediate';
        if (desc.includes('small') || desc.includes('hairline')) return 'Low';
        return 'Moderate';
    }

    if (issue === 'Leakage') {
        if (desc.includes('flood') || desc.includes('heavy') || desc.includes('burst')) return 'Immediate';
        if (desc.includes('damp') || desc.includes('moisture')) return 'Low';
        return 'Moderate';
    }

    // Simplified version of the Python rules
    const highRiskKeywords = ['dangerous', 'urgent', 'falling', 'collapse', 'fire', 'shock'];
    if (highRiskKeywords.some(word => desc.includes(word))) return 'Immediate';

    return 'Moderate';
};

export const estimateCost = (issue: string, severity: string): string => {
    // Placeholder logic, can be refined to match Python exactly if needed
    const rates: Record<string, number> = {
        'Crack': 500,
        'Leakage': 800,
        'Electrical': 1200,
        'Mould': 300,
        'Tiles': 400
    };

    const multiplier: Record<string, number> = {
        'Low': 1,
        'Moderate': 2,
        'Immediate': 5
    };

    const base = rates[issue] || 500;
    const mult = multiplier[severity] || 2;

    return `₹${base * mult} - ₹${base * mult * 1.5}`;
};
