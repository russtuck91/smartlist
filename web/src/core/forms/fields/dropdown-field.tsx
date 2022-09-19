import { MenuItem, Select } from '@material-ui/core';
import { Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';

import { asFormField, FormFieldProps } from '../as-form-field';

type CustomOptionRenderer = (props: CustomOptionRendererProps) => React.ReactNode;

export interface CustomOptionRendererProps {
    option: string;
    index: number;
}

interface DropdownInputProps extends FormFieldProps {
    id: string;
    value?: any;
    options: string[];

    customOptionRenderer?: CustomOptionRenderer;
    IconComponent?: React.ElementType;
    variant?: 'standard'|'filled'|'outlined';
}

const useStyles = (theme: Theme) => ({
    select: {
        padding: theme.spacing(1),
    },
    menuItem: {
        minHeight: 0,
    },
});

type FullProps = DropdownInputProps & WithStyles<typeof useStyles>;

interface DropdownInputState {
    open: boolean;
}

export class RawDropdownInput extends React.Component<FullProps, DropdownInputState> {
    state = {
        open: false,
    };

    render() {
        return (
            <Select
                id={this.props.id}
                name={this.props.id}
                value={this.props.value}
                onChange={this.props.onChange}
                classes={{
                    select: this.props.classes.select,
                }}
                disabled={this.props.disabled}
                variant={this.props.variant || 'outlined'}
                open={this.state.open}
                onOpen={this.handleOpen}
                onClose={this.handleClose}
                IconComponent={this.props.IconComponent}
            >
                {this.renderMenuItems()}
            </Select>
        );
    }

    private renderMenuItems() {
        const { options } = this.props;

        return options.map((opt, index) => {
            return (
                <MenuItem
                    key={index}
                    value={opt}
                    className={this.props.classes.menuItem}
                >
                    {this.optionRenderer(opt, index)}
                </MenuItem>
            );
        });
    }

    private optionRenderer(option: string, index: number) {
        if (this.props.customOptionRenderer) {
            const customRenderResult = this.props.customOptionRenderer({
                option,
                index,
            });
            if (customRenderResult != null) {
                return customRenderResult;
            }
        }

        return option;
    }

    private handleOpen = (e: React.ChangeEvent) => {
        if (this.hasButtonAncestor(e.target)) {
            return;
        }
        this.setState({
            open: true,
        });
    };

    private hasButtonAncestor(node: Element): boolean {
        if (node.classList.contains('MuiButtonBase-root')) {
            return true;
        }
        if (node.parentElement) {
            return this.hasButtonAncestor(node.parentElement);
        }
        return false;
    }

    private handleClose = () => {
        this.setState({
            open: false,
        });
    };
}

export const DropdownInput = withStyles(useStyles)(RawDropdownInput);

export const DropdownField = asFormField<DropdownInputProps & FormFieldProps>(DropdownInput);
