#include "project.h"

CY_ISR_PROTO(uart_1_rx_handler);
void StartPumping();
void StopPumping();

int main(void)
{
    UART_1_Start();
    CyGlobalIntEnable; /* Enable global interrupts. */
    
    UART_1_PutString("startet");
    isr_1_Start();
    isr_1_StartEx(uart_1_rx_handler);
	
    for(;;)
    {
    }
}

CY_ISR(uart_1_rx_handler)
{
    uint8_t numberOfBytes = UART_1_GetRxBufferSize();
    for (uint8_t i=0; i < numberOfBytes;i++)
    {
        char c = UART_1_GetChar();
        UART_1_PutChar(c);
        switch(c)
        {
            case 's':
            {
                StartPumping();
				CyDelay(10000);
				StopPumping();
            }
			break;
            case 'm':
            {
                StartPumping();
				CyDelay(19000);
				StopPumping();
            }
			break;
			case 'l':
            {
                StartPumping();
				CyDelay(28000);
				StopPumping();
            }
			break;
        }
    }
}
void StartPumping()
{
	PumpPin_Write(1);
}
void StopPumping()
{
	PumpPin_Write(0);
}