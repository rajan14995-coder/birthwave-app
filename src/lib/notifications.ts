import { db } from './db';

export type NotificationType =
  | 'CANCELLED_BY_DOCTOR'
  | 'RESCHEDULED_AUTO'
  | 'RESCHEDULED_MANUAL'
  | 'MOVED_TO_PENDING';

type NotifyArgs = {
  patientId: string;
  appointmentId?: string;
  type: NotificationType;
  title: string;
  message: string;
  oldDate?: string | null;
  oldTime?: string | null;
  newDate?: string | null;
  newTime?: string | null;
};

/**
 * Creates an in-app notification record for the patient — this is the real,
 * working delivery channel today (visible in the Patient Portal notifications list).
 *
 * To also send Email/SMS: this project has no Email/SMS provider configured yet
 * (no Twilio/SendGrid/MSG91 credentials or SDK in package.json). Wire one in below
 * once you have an account — nothing here should pretend a message was sent when
 * it wasn't.
 */
export async function notifyPatient(args: NotifyArgs) {
  const notification = await (db as any).notification.create({
    data: {
      patientId: args.patientId,
      appointmentId: args.appointmentId,
      type: args.type,
      title: args.title,
      message: args.message,
      oldDate: args.oldDate ?? null,
      oldTime: args.oldTime ?? null,
      newDate: args.newDate ?? null,
      newTime: args.newTime ?? null,
    },
  });

  // --- Email/SMS integration point (not implemented — see comment above) ---
  // const patient = await (db as any).patient.findUnique({ where: { id: args.patientId } });
  // await sendSms(patient.phone, args.message);
  // await sendEmail(patient.email, args.title, args.message);

  return notification;
}

export function buildCancellationMessage(doctorName: string, date: string, time: string, reason?: string) {
  const reasonText = reason ? ` Reason: ${reason}.` : '';
  return {
    title: 'Appointment Cancelled',
    message: `Your appointment with Dr. ${doctorName} on ${date} at ${time} has been cancelled by the doctor.${reasonText}`,
  };
}

export function buildAutoRescheduleMessage(
  doctorName: string,
  oldDate: string,
  oldTime: string,
  newDate: string,
  newTime: string
) {
  return {
    title: 'Appointment Rescheduled',
    message: `Dr. ${doctorName} is unavailable on ${oldDate}. Your appointment has been automatically moved from ${oldDate} at ${oldTime} to ${newDate} at ${newTime}. If this new time doesn't work for you, please contact us to reschedule.`,
  };
}

export function buildManualRescheduleMessage(
  doctorName: string,
  oldDate: string,
  oldTime: string,
  newDate: string,
  newTime: string
) {
  return {
    title: 'Appointment Updated',
    message: `Your appointment with Dr. ${doctorName} has been updated from ${oldDate} at ${oldTime} to ${newDate} at ${newTime}.`,
  };
}

export function buildMovedToPendingMessage(doctorName: string, date: string) {
  return {
    title: 'Appointment Needs Reconfirmation',
    message: `Your appointment with Dr. ${doctorName} on ${date} has been moved back to pending and will be reconfirmed shortly.`,
  };
}
