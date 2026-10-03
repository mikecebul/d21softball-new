import { createFormHook } from "@tanstack/react-form"
import { fieldContext, formContext } from "./form-context"
import {
  AcknowledgementField,
  NotesField,
  SelectField,
  TextField,
} from "./fields"

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, SelectField, NotesField, AcknowledgementField },
  formComponents: {},
})
