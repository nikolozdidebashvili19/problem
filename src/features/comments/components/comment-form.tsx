'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { CommentFormSchema, CommentFormType } from '@/features/reports/validations/report.validation';
import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Textarea } from '@/shared/components/ui/textarea';

type CommentFormProps = {
  label: string;
  placeholder: string;
  initialBody?: string;
  // Reply forms open on demand, so they take focus and can be dismissed
  onCancel?: () => void;
  // Resolves to true when posted, so the form can reset
  onSubmit: (body: string) => Promise<boolean>;
};

export const CommentForm = ({ label, placeholder, initialBody = '', onCancel, onSubmit }: CommentFormProps) => {
  const t = useTranslations('comments');
  const isReply = Boolean(onCancel);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const form = useForm<CommentFormType>({
    resolver: zodResolver(CommentFormSchema),
    defaultValues: { body: initialBody },
  });
  const posting = form.formState.isSubmitting;

  // Caret goes after a prefilled @mention
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!isReply || !textarea) return;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [isReply]);

  const submit = async (values: CommentFormType) => {
    if (await onSubmit(values.body)) form.reset({ body: '' });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} noValidate className="flex flex-col gap-2">
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">{label}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  ref={(element) => {
                    field.ref(element);
                    textareaRef.current = element;
                  }}
                  rows={isReply ? 2 : 3}
                  placeholder={placeholder}
                  className={isReply ? 'min-h-16' : 'min-h-20'}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={posting} className="h-10 rounded-full px-4">
              {t('cancel')}
            </Button>
          )}
          <Button type="submit" disabled={posting} className="h-10 rounded-full px-5 font-semibold">
            {posting ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Send aria-hidden="true" className="size-4" />}
            {posting ? t('posting') : t('post')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
