import React from 'react';

import { GenreRule } from '../../../../shared';

import { AutocompleteField } from '../../core/forms/fields';
import { baseRequestUrl } from '../../core/requests/requests';


interface GenreRuleAutocompleteFieldProps {
    id: string;
    rule: GenreRule;
}

export class GenreRuleAutocompleteField extends React.Component<GenreRuleAutocompleteFieldProps> {
    render() {
        return (
            <AutocompleteField
                id={this.props.id}
                value={this.props.rule.value}
                getSearchUrl={this.getSearchUrl}
                required
                freeSolo
            />
        );
    }

    private getSearchUrl(text: string) {
        return `${baseRequestUrl}/search/genre?text=${encodeURIComponent(text)}`;
    }
}
