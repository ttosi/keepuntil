#include <EEPROM.h>
#include <Keypad.h>
#include <Servo.h>
#include <DS3231.h>
#include <SoftwareSerial.h>

#define DEBUG false
#define SET_RTC false
#define SHOW_TIME false

const byte LOCK_SERVO_PIN = 4;
const byte LOCK_OPEN = 130;
const byte LOCK_CLOSED = 90;

const byte LOCKING_SOLENOID_PIN = 3;

const byte IS_OPEN_ADDRESS = 0;
const byte OPEN_AT_TIME_ADDRESS = 1;

const byte KEYPAD_ROWS = 4;
const byte KEYPAD_COLS = 4;

const byte LCD_TX_PIN = 2;

const byte CLOSED_LED = 7;
const byte OPEN_LED = 8;

byte rowPins[KEYPAD_ROWS] = { 5, 6, 7, 8 };
byte colPins[KEYPAD_COLS] = { 9, 10, 11, 12 };

String validKeys = "1234567890DC";
char keys[KEYPAD_ROWS][KEYPAD_COLS] = {
	{ '1', '2', '3', 'A' },
	{ '4', '5', '6', 'B' },
	{ '7', '8', '9', 'C' },
	{ '*', '0', '#', 'D' }
};

long openAtTime = EEPROMReadlong(OPEN_AT_TIME_ADDRESS);
bool isOpen = EEPROM.read(IS_OPEN_ADDRESS) == 1 ? true : false;
int waitToCloseLockDuration = 10 * 1000;

DS3231 rtc(SDA, SCL);
Servo lockServo;
SoftwareSerial lcdSerial = SoftwareSerial(255, LCD_TX_PIN);
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, KEYPAD_ROWS, KEYPAD_COLS);

void setup()
{
	if (DEBUG) Serial.begin(115200);

	rtc.begin();

	// day, month, year, 24 hour, minute, second
	if (SET_RTC) setRtc(12, 1, 2016, 20, 42, 15);

	if (SET_RTC || SHOW_TIME)
	{
		while (1)
		{
			printTimeString();
			delay(1000);
		}
	}

	lcdSerial.begin(9600);
	delay(100);

	pinMode(OPEN_LED, OUTPUT);
	pinMode(CLOSED_LED, OUTPUT);
	pinMode(LOCKING_SOLENOID_PIN, OUTPUT);

	openAtTime = EEPROMReadlong(OPEN_AT_TIME_ADDRESS);
	isOpen = EEPROM.read(IS_OPEN_ADDRESS) == 1 ? true : false;

	if (DEBUG) printDebugInfo();
}

void loop()
{
	if (openAtTime <= getRtcTime())
	{
		if (!isOpen)
		{
			lockControl("open");
		}

		setOpenAtTime();
	}
	else
	{
		if (isOpen)
		{
			lcdSerial.write(18);
			lcdSerial.write(21);

			lockControl("closed");
		}
	}

	if (DEBUG) printDebugInfo();

	delay(1000);
}

void setOpenAtTime()
{
	lcdSerial.write(24);
	delay(50);

	lcdSerial.write(12);
	lcdSerial.write(17);
	delay(5);

	Time now = rtc.getTime();

	Time t;
	t.mon = getInput("Month: ", String(now.mon));
	t.date = getInput("Day: ", String(now.date));
	t.year = getInput("Year: ", String(now.year));
	t.hour = getInput("Hour (24hr): ", String(now.hour));
	t.min = getInput("Minute: ", String(now.min));
	t.sec = 0;

	lcdSerial.write(12);
	delay(5);

	if (DEBUG) Serial.println(rtc.getUnixTime(t));

	lcdSerial.print(String(t.mon) + "/" +
		String(t.date) + "/" + 
		String(t.year) + " " + 
		String(t.hour) + ":" + 
		String(t.min));

	lcdSerial.write(13);
	lcdSerial.write("1-Yes, 2-No");

	char confirm = keypad.waitForKey();

	if (confirm == '1')
	{
		lcdSerial.write(12);
		delay(5);
		lcdSerial.write("You have 10 sec");
		lcdSerial.write(13);
		lcdSerial.write("to close the lid");
	}
	else
	{
		setOpenAtTime();
	}

	openAtTime = rtc.getUnixTime(t);

	EEPROMWritelong(OPEN_AT_TIME_ADDRESS, openAtTime);

	delay(waitToCloseLockDuration);
}

int getInput(String label, String defaultValue)
{
	lcdSerial.write(12);
	delay(50);

	char input[5];
	byte pos = defaultValue.length();

	defaultValue.toCharArray(input, defaultValue.length() + 1);

	lcdSerial.print(label);
	lcdSerial.print(defaultValue);

	while (true)
	{
		char key = keypad.waitForKey();

		if (key != NO_KEY && validKeys.indexOf(key) != -1)
		{
			if (key == 'D')
			{
				return atol(input);
			}
			else if (key == 'C')
			{
				input[pos] = char(0);

				if (pos != 0)
				{
					pos--;
					lcdSerial.write(0x08);
				}
			}
			else
			{
				lcdSerial.write(key);
				input[pos] = key;
				pos++;
			}
		}
	}
}

void lockControl(String position)
{
	if (position == "closed")
	{
		digitalWrite(LOCKING_SOLENOID_PIN, HIGH);

		delay(500);

		lockServo.write(LOCK_CLOSED);
		lockServo.attach(LOCK_SERVO_PIN);

		delay(500);

		digitalWrite(LOCKING_SOLENOID_PIN, LOW);

		EEPROM.write(IS_OPEN_ADDRESS, 0);
		isOpen = false;
	}
	else if (position == "open")
	{
		digitalWrite(LOCKING_SOLENOID_PIN, HIGH);

		delay(500);

		lockServo.write(LOCK_OPEN);
		lockServo.attach(LOCK_SERVO_PIN);

		delay(500);

		digitalWrite(LOCKING_SOLENOID_PIN, LOW);

		EEPROM.write(IS_OPEN_ADDRESS, 1);
		isOpen = true;
	}

	delay(500);
	lockServo.detach();
}

long getRtcTime()
{
	return rtc.getUnixTime(rtc.getTime());
}

void setRtc(int day, int month, int year, int hour, int minute, int second)
{
	rtc.setTime(hour, minute, second);
	rtc.setDate(day, month, year);
}

void printTimeString()
{
	Serial.print(rtc.getDateStr());
	Serial.print(" ");
	Serial.println(rtc.getTimeStr());
}

void printDebugInfo()
{
	Serial.print("rtc time:\t");
	printTimeString();
	Serial.print("rtc unix time:\t");
	Serial.println(getRtcTime());
	Serial.print("oat:\t\t");
	Serial.println(openAtTime);
	Serial.print("second remain:\t");
	Serial.println(openAtTime - getRtcTime());
	Serial.print("is open flag:\t");
	Serial.println(isOpen);
}

// ATTRIBUTION:
// Created by Kevin Elsenberger 
// June 2, 2013
// elsenberger.k at gmail.com 
// http://playground.arduino.cc/Code/EEPROMReadWriteLong
long EEPROMReadlong(long address)
{
	long four = EEPROM.read(address);
	long three = EEPROM.read(address + 1);
	long two = EEPROM.read(address + 2);
	long one = EEPROM.read(address + 3);

	return ((four << 0) & 0xFF) + ((three << 8) & 0xFFFF) + ((two << 16) & 0xFFFFFF) + ((one << 24) & 0xFFFFFFFF);
}

// ATTRIBUTION:
// Created by Kevin Elsenberger 
// June 2, 2013
// elsenberger.k at gmail.com 
// http://playground.arduino.cc/Code/EEPROMReadWriteLong
void EEPROMWritelong(int address, long value)
{
	byte four = (value & 0xFF);
	byte three = ((value >> 8) & 0xFF);
	byte two = ((value >> 16) & 0xFF);
	byte one = ((value >> 24) & 0xFF);

	EEPROM.write(address, four);
	EEPROM.write(address + 1, three);
	EEPROM.write(address + 2, two);
	EEPROM.write(address + 3, one);
}
