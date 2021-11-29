import {
	parseISO,
	endOfDay,
	startOfDay,
	getOverlappingDaysInIntervals,
	getDaysInMonth,
	isSameDay
} from 'date-fns'

interface Interval {
	start: Date
	contractSubscritionFee: number
	end?: Date
}

interface IntervalCharge {
	contractSubscritionFee: number
	daysToCharge: number
	startDate: Date
	endDate: Date
	proportionalValueToCharge: number
	valuePerDay: number
}

export enum Status {
	ACTIVE = 'ACTIVE',
	DISSOCIATED = 'DISSOCIATED'
}

export type StatusEnum = keyof typeof Status

export class Log {
	status: StatusEnum
	changeDate: Date
	contractSubscriptionFee: number
}

const logs: Log[] = [
	{
		status: 'ACTIVE',
		changeDate: parseISO('2021-11-02T08:00:00.000Z'),
		contractSubscriptionFee: 1500
	},
	{
		status: 'DISSOCIATED',
		changeDate: parseISO('2021-11-02T20:00:00.000Z'),
		contractSubscriptionFee: 1500
	},
	{
		status: 'ACTIVE',
		changeDate: parseISO('2021-11-02T13:00:00.000Z'),
		contractSubscriptionFee: 3000
	},
	{
		status: 'DISSOCIATED',
		changeDate: parseISO('2021-11-05T14:00:00.000Z'),
		contractSubscriptionFee: 3000
	},
	{
		status: 'ACTIVE',
		changeDate: parseISO('2021-11-08T05:00:00.000Z'),
		contractSubscriptionFee: 750
	}
]

const start = startOfDay(parseISO('2021-11-01'))
const end = endOfDay(parseISO('2021-11-25'))

export function logIntervalsToCharge(
	kitLogs: Log[],
	start: Date,
	end: Date
): IntervalCharge[] {
	const intervals: Interval[] = []
	kitLogs.forEach((log) => {
		const dateIsActive = !!(log.status === 'ACTIVE')
		const changeDate = dateIsActive
			? startOfDay(log.changeDate)
			: endOfDay(log.changeDate)

		if (dateIsActive) {
			intervals.push({
				start: changeDate,
				contractSubscritionFee: log.contractSubscriptionFee
			})
		} else {
			const currentInterval = intervals[intervals.length - 1]

			if (
				!currentInterval.start ||
				(currentInterval.start && currentInterval.end)
			)
				return

			intervals[intervals.length - 1] = {
				...intervals[intervals.length - 1],
				end: changeDate
			}
		}
	})

	const intervalsCharge = intervalsToCharge(intervals, start, end)

	return intervalsCharge
}

export function intervalsToCharge(
	intervals: Interval[],
	startDate: Date,
	endDate: Date
) {
	const intervalsCharge: IntervalCharge[] = []
	const daysInMonth = getDaysInMonth(startDate)
	intervals.forEach((interval, i) => {
		try {
			const intervalStart = interval.start
			const intervalEnd = interval.end || endDate

			const isWithin = getOverlappingDaysInIntervals(
				{ start: startDate, end: endDate },
				{ start: intervalStart, end: intervalEnd }
			)
			if (!isWithin) return

			const nextInterval = intervals[i + 1]
			const nextSameDay =
				nextInterval && isSameDay(intervalEnd, nextInterval.start)
			const daysToCharge = nextSameDay ? isWithin - 1 : isWithin

			const valuePerDay = interval.contractSubscritionFee / daysInMonth
			const proportionalValueToCharge = valuePerDay * isWithin

			intervalsCharge.push({
				contractSubscritionFee: interval.contractSubscritionFee,
				daysToCharge,
				startDate: intervalStart,
				endDate: interval.end,
				proportionalValueToCharge,
				valuePerDay
			})
		} catch (error) {
			error
		}
	})

	return intervalsCharge
}

export function getProportionalSubscriptionFee(
	kitLogs: Log[],
	start: Date,
	end: Date
) {
	const intervalsCharge = logIntervalsToCharge(kitLogs, start, end)

	const valueToChargeTotal = intervalsCharge.reduce((intervalCharge, next) => {
		const { proportionalValueToCharge } = next

		return intervalCharge + proportionalValueToCharge
	}, 0)

	return valueToChargeTotal
}

const x = logIntervalsToCharge(logs, start, end)
x
