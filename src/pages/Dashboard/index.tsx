import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { isToday, format, isAfter } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import DayPicker, { DayModifiers } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import { FiClock, FiPower } from 'react-icons/fi';
import { parseISO } from 'date-fns/esm';
import { Link } from 'react-router-dom';
import {
  Container,
  Header,
  HeaderContent,
  Profile,
  Content,
  Schedule,
  NextAppointments,
  Calendar,
  Section,
  Appointment,
} from './styles';

import logoImg from '../../assets/logo.svg';
import { useAuth } from '../../hooks/Auth';
import api from '../../services/api';

interface MonthAvailabilityItem {
  day: number;
  available: boolean;
}

interface AppointmentCard {
  id: string;
  date: string;
  hourFormatted: string;
  user: {
    name: string;
    avatar_url: string;
  };
}

const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<AppointmentCard[]>([]);

  // const [currentMonth, setCurrentMonth] = useState(new Date());
  // const [monthAvailability, setMonthAvailability] = useState<
  //   MonthAvailabilityItem[]
  // >([]);

  const { signOut, user } = useAuth();

  const showToday = useMemo(() => isToday(selectedDate) && <span>Hoje</span>, [
    selectedDate,
  ]);

  const showDate = useMemo(
    () =>
      format(selectedDate, "'Dia' dd 'de' MMMM", {
        locale: ptBR,
      }),
    [selectedDate],
  );

  const showWeekDay = useMemo(
    () =>
      format(selectedDate, 'cccc', {
        locale: ptBR,
      }),
    [selectedDate],
  );

  const handleDayChange = useCallback((day: Date, modifiers: DayModifiers) => {
    if (modifiers.available) {
      setSelectedDate(day);
    }
  }, []);

  // const handleMonthChange = useCallback((month: Date) => {
  //   setCurrentMonth(month);
  // }, []);

  // useEffect(() => {
  //   api
  //     .get(`/providers/${user.id}/month-availability`, {
  //       params: {
  //         year: currentMonth.getFullYear(),
  //         month: currentMonth.getMonth() + 1,
  //       },
  //     })
  //     .then(response => {
  //       setMonthAvailability(response.data);
  //     });
  // }, [currentMonth, user.id]);

  useEffect(() => {
    api
      .get<AppointmentCard[]>('/appointments/me', {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then(response => {
        const appointmentsFormatted = response.data.map(appointment => {
          return {
            ...appointment,
            hourFormatted: format(parseISO(appointment.date), 'HH:mm'),
          };
        });

        appointmentsFormatted.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        setAppointments(appointmentsFormatted);
      });
  }, [selectedDate]);

  const nextAppointment = useMemo(() => {
    return appointments.find(appointment =>
      isAfter(parseISO(appointment.date), new Date()),
    );
  }, [appointments]);

  // const disabledDays = useMemo(() => {
  //   const dates = monthAvailability
  //     .filter(monthDay => monthDay.available === false)
  //     .map(monthDay => {
  //       const year = currentMonth.getFullYear();
  //       const month = currentMonth.getMonth();

  //       return new Date(year, month, monthDay.day);
  //     });

  //   return dates;
  // }, [currentMonth, monthAvailability]);

  const morningAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      return parseISO(appointment.date).getHours() < 12;
    });
  }, [appointments]);

  const afternoonAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      return parseISO(appointment.date).getHours() >= 12;
    });
  }, [appointments]);

  const today = useMemo(() => {
    return new Date();
  }, []);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <img src={logoImg} alt="GoBarber logo" />

          <Profile>
            <Link to="/profile">
              <img src={user.avatar_url} alt={user.name} />
            </Link>
            <div>
              <span>Bem-vindo,</span>
              <Link to="/profile">
                <strong>{user.name}</strong>
              </Link>
            </div>
          </Profile>

          <button type="button" onClick={signOut}>
            <FiPower />
          </button>
        </HeaderContent>
      </Header>
      <Content>
        <Schedule>
          <h1>Horários agendados</h1>
          <p>
            {showToday}
            <span>{showDate}</span>
            <span>{showWeekDay}</span>
          </p>

          {isToday(selectedDate) && nextAppointment && (
            <NextAppointments>
              <strong>Próximo agendamento</strong>
              <div>
                <img
                  src={nextAppointment.user.avatar_url}
                  alt={nextAppointment.user.name}
                />
                <strong>{nextAppointment.user.name}</strong>
                <span>
                  <FiClock />
                  08:00
                </span>
              </div>
            </NextAppointments>
          )}

          <Section>
            <strong>Manhã</strong>

            {morningAppointments.length === 0 && (
              <p>Nenhum agendamento neste período</p>
            )}

            {morningAppointments.map(appointment => (
              <Appointment key={appointment.id}>
                <span>
                  <FiClock />
                  {appointment.hourFormatted}
                </span>
                <div>
                  <img
                    src={appointment.user.avatar_url}
                    alt={appointment.user.name}
                  />
                  <strong>{appointment.user.name}</strong>
                </div>
              </Appointment>
            ))}
          </Section>
          <Section>
            <strong>Tarde</strong>

            {afternoonAppointments.length === 0 && (
              <p>Nenhum agendamento neste período</p>
            )}

            {afternoonAppointments.map(appointment => (
              <Appointment key={appointment.id}>
                <span>
                  <FiClock />
                  {appointment.hourFormatted}
                </span>
                <div>
                  <img
                    src={appointment.user.avatar_url}
                    alt={appointment.user.name}
                  />
                  <strong>{appointment.user.name}</strong>
                </div>
              </Appointment>
            ))}
          </Section>
        </Schedule>
        <Calendar>
          <DayPicker
            weekdaysShort={['D', 'S', 'T', 'Q', 'Q', 'S', 'S']}
            fromMonth={new Date()}
            disabledDays={[{ daysOfWeek: [0, 6] }, { before: today }]}
            selectedDays={selectedDate}
            modifiers={{ available: { daysOfWeek: [1, 2, 3, 4, 5] } }}
            onDayClick={handleDayChange}
            months={[
              'Janeiro',
              'Fevereiro',
              'Março',
              'Abril',
              'Maio',
              'Junho',
              'Julho',
              'Agosto',
              'Setembro',
              'Outubro',
              'Novembro',
              'Dezembro',
            ]}
          />
        </Calendar>
      </Content>
    </Container>
  );
};

export default Dashboard;
